import { EventEmitter } from 'node:events'
import { InstanceStatus, TCPHelper, type LogLevel } from '@companion-module/base'
import PQueue from 'p-queue'
import { CrosspointControlBusSelection, Messages, MsgSyntax } from './enums.js'
import { FrameReader, parseMessage, type ParsedMessage } from './parseMsg.js'
import { errorMessage } from './utils.js'

export interface ConnectionTiming {
	/** Least time from sending one message to sending the next */
	messageInterval: number
	/** How long the connection may sit idle before a bus status query is sent to keep it open */
	keepaliveInterval: number
	reconnectInterval: number
}

export const DEFAULT_TIMING: ConnectionTiming = {
	messageInterval: 16,
	keepaliveInterval: 10000,
	reconnectInterval: 10000,
}

/**
 * A switcher that has replied on this connection and then sends nothing for this many keepalive intervals is taken to
 * have gone, and the connection is reopened. A pulled cable or a power cut leaves the socket open: TCPHelper enables TCP
 * keepalive at the OS default, which on most systems takes two hours to notice.
 *
 * Only a switcher known to reply is watched, so one that never answers is not reconnected every keepalive.
 */
export const WATCHDOG_INTERVALS = 2.5

export interface ConnectionOptions {
	host: string
	port: number
	log: (level: LogLevel, message: string) => void
	/** Defaults to {@link DEFAULT_TIMING}. Tests shorten it */
	timing?: Partial<ConnectionTiming>
}

export interface ConnectionEvents {
	/** A connection has opened. Fires again on every reconnection */
	connected: []
	message: [message: ParsedMessage]
	status: [status: InstanceStatus, message: string | null]
}

/** A message as it goes on the wire */
export function encodeMessage(command: Messages, args: readonly string[] = []): string {
	return MsgSyntax.Stx + [command, ...args].join(MsgSyntax.Sep) + MsgSyntax.Etx
}

/**
 * The TCP control connection to an AV-HSW10: framing, pacing, keepalive and reconnection. Knows nothing of Companion
 * beyond reporting a status for it.
 */
export class SwitcherConnection extends EventEmitter<ConnectionEvents> {
	readonly #options: ConnectionOptions
	readonly #timing: ConnectionTiming
	readonly #queue: PQueue
	readonly #reader = new FrameReader()
	#socket: TCPHelper | undefined
	/** Exists while a connection is open, and is aborted as it closes, which drops everything queued for it */
	#session: AbortController | undefined
	#keepaliveTimer: NodeJS.Timeout | undefined
	#lastReceived = 0
	#replies = false
	/** Set by the first failure of an outage, so retries against a switcher that is off don't flood the log */
	#outageLogged = false
	#lastStatus: { status: InstanceStatus; message: string | null } | undefined
	#destroyed = false

	constructor(options: ConnectionOptions) {
		super()
		this.#options = options
		this.#timing = { ...DEFAULT_TIMING, ...options.timing }
		this.#queue = new PQueue({ concurrency: 1, interval: this.#timing.messageInterval, intervalCap: 1 })
	}

	get isConnected(): boolean {
		return this.#session !== undefined
	}

	/** Opens the connection, replacing any already open. After that, TCPHelper reconnects by itself */
	connect(): void {
		if (this.#destroyed) throw new Error('Switcher connection has been destroyed')
		this.#closeSocket()
		const { host, port } = this.#options
		this.#status(InstanceStatus.Connecting, `Connecting to ${host}:${port}`)
		const socket = new TCPHelper(host, port, { reconnect: true, reconnect_interval: this.#timing.reconnectInterval })
		this.#socket = socket
		socket.on('connect', () => this.#open())
		socket.on('data', (chunk) => this.#receive(chunk))
		socket.on('end', () => {
			this.#close()
			this.#status(InstanceStatus.Disconnected, 'Connection closed by switcher')
			this.#logOutage('warn', `Connection closed by ${host}:${port}`)
		})
		socket.on('error', (err) => {
			this.#close()
			this.#status(InstanceStatus.ConnectionFailure, err.message)
			this.#logOutage('error', `Network error: ${err.message}`)
		})
	}

	/** Closes the connection for good. Anything still queued is rejected */
	destroy(): void {
		this.#destroyed = true
		this.removeAllListeners()
		this.#closeSocket()
	}

	/**
	 * Queues a message for the switcher
	 * @param signal an action's context.signal. A message whose signal aborts before its turn is never sent
	 * @returns once the message is written to the socket
	 * @throws if there is no connection, or it closes or the signal aborts before the message is sent
	 */
	async send(command: Messages, args: readonly string[] = [], signal?: AbortSignal): Promise<void> {
		const session = this.#session
		if (session === undefined) throw new Error('Not connected to switcher')
		const message = encodeMessage(command, args)
		// p-queue listens on the combined signal from the moment the job is queued, which makes it pass an abort on
		// eagerly. Only reading .aborted could miss one: AbortSignal.any holds its sources weakly
		const combined = signal ? AbortSignal.any([session.signal, signal]) : session.signal
		await this.#queue.add(
			async ({ signal: jobSignal }) => {
				jobSignal?.throwIfAborted()
				const socket = this.#socket
				if (!socket?.isConnected || !(await socket.sendAsync(message))) throw new Error('Not connected to switcher')
				this.#options.log('debug', `Message sent: ${printable(message)}`)
				this.#scheduleKeepalive()
			},
			{ signal: combined },
		)
	}

	#open(): void {
		this.#close()
		const { host, port } = this.#options
		this.#session = new AbortController()
		this.#reader.reset()
		this.#lastReceived = Date.now()
		this.#replies = false
		this.#outageLogged = false
		this.#options.log('info', `Connected to ${host}:${port}`)
		this.#status(InstanceStatus.Ok, null)
		this.#scheduleKeepalive()
		this.emit('connected')
	}

	/** Ends the session, if one is open: everything queued for it is rejected, and the keepalive stopped */
	#close(): void {
		const session = this.#session
		if (session === undefined) return
		this.#session = undefined
		clearTimeout(this.#keepaliveTimer)
		this.#keepaliveTimer = undefined
		session.abort(new Error('Connection to switcher closed'))
		this.#reader.reset()
	}

	#closeSocket(): void {
		this.#close()
		// TCPHelper's destroy removes its listeners first, so the old socket can't report anything once replaced
		this.#socket?.destroy()
		this.#socket = undefined
	}

	#receive(chunk: Buffer): void {
		this.#lastReceived = Date.now()
		this.#replies = true
		for (const text of this.#reader.push(chunk)) {
			try {
				this.emit('message', parseMessage(text))
			} catch (err) {
				// This runs in the socket's data listener, where a throw would end the module's process
				this.#options.log('error', `Could not handle message ${printable(text)}: ${errorMessage(err)}`)
			}
		}
	}

	/** Restarts the wait for the connection to fall idle. Called on connecting, and after every message sent */
	#scheduleKeepalive(): void {
		if (this.#session === undefined) return
		clearTimeout(this.#keepaliveTimer)
		this.#keepaliveTimer = setTimeout(() => this.#keepalive(), this.#timing.keepaliveInterval)
	}

	#keepalive(): void {
		this.#keepaliveTimer = undefined
		const silence = Date.now() - this.#lastReceived
		if (this.#replies && silence > this.#timing.keepaliveInterval * WATCHDOG_INTERVALS) {
			this.#options.log('warn', `Nothing received from switcher for ${silence} ms, reconnecting`)
			this.connect()
			return
		}
		// Sending reschedules the keepalive. Its only failure is the connection closing, which is reported already
		this.send(Messages.BusStatusQuery, [CrosspointControlBusSelection.PGM]).catch((err) =>
			this.#options.log('debug', `Keepalive not sent: ${errorMessage(err)}`),
		)
	}

	#status(status: InstanceStatus, message: string | null): void {
		if (this.#lastStatus?.status === status && this.#lastStatus.message === message) return
		this.#lastStatus = { status, message }
		this.emit('status', status, message)
	}

	#logOutage(level: LogLevel, message: string): void {
		this.#options.log(this.#outageLogged ? 'debug' : level, message)
		this.#outageLogged = true
	}
}

/** A message with its STX and ETX made visible, for the log */
export function printable(message: string): string {
	return message.replaceAll(MsgSyntax.Stx, '<STX>').replaceAll(MsgSyntax.Etx, '<ETX>')
}
