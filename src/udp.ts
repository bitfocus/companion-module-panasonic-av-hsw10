import { lookup } from 'node:dns/promises'
import { isIPv4 } from 'node:net'
import type { RemoteInfo } from 'node:dgram'
import type { LogLevel, SharedUdpSocket, SharedUdpSocketMessageCallback } from '@companion-module/base'
import { messagesInDatagram, parseMessage, type ParsedMessage } from './parseMsg.js'
import { errorMessage } from './utils.js'

export interface UdpListenerOptions {
	/** The switcher. Only datagrams from it are taken, as other switchers may send to the same shared port */
	host: string
	port: number
	/** InstanceBase.createSharedUdpSocket */
	createSocket: (callback: SharedUdpSocketMessageCallback) => SharedUdpSocket
	onMessage: (message: ParsedMessage) => void
	log: (level: LogLevel, message: string) => void
	/** The IPv4 addresses of a hostname. Tests replace it */
	resolve?: (hostname: string) => Promise<string[]>
}

async function resolveIPv4(hostname: string): Promise<string[]> {
	return (await lookup(hostname, { all: true, family: 4 })).map(({ address }) => address)
}

/** The bus status notifications the switcher sends by UDP */
export class UdpListener {
	readonly #options: UdpListenerOptions
	readonly #socket: SharedUdpSocket
	/** The switcher's addresses. A datagram's sender is an address, never the hostname the config may hold */
	readonly #addresses = new Set<string>()
	/** Set once the socket is listening. Until then it can't be closed: SharedUdpSocket.close throws while binding */
	#bound = false
	#closed = false

	constructor(options: UdpListenerOptions) {
		this.#options = options
		const { host, port, log } = options
		if (isIPv4(host)) {
			this.#addresses.add(host)
		} else {
			;(options.resolve ?? resolveIPv4)(host).then(
				(addresses) => {
					if (this.#closed) return
					for (const address of addresses) this.#addresses.add(address)
					log('debug', `UDP messages taken from ${host} at ${addresses.join(', ')}`)
				},
				(err) => log('warn', `Could not resolve ${host}, so no UDP messages will be taken: ${errorMessage(err)}`),
			)
		}
		this.#socket = options.createSocket((datagram, remote) => this.#receive(datagram, remote))
		this.#socket.on('error', (err) => log('error', `Error from UDP Listener: ${err.message}`))
		this.#socket.on('close', () => log('info', `Closed shared udp socket on port ${port}`))
		this.#socket.bind(port, undefined, () => {
			this.#bound = true
			if (this.#closed) {
				this.#closeSocket()
				return
			}
			log('debug', `Listening for UDP messages from ${host} on 0.0.0.0:${port}`)
		})
	}

	/** Never throws. A socket still binding is closed once bound, and one that failed to bind needs no closing */
	close(): void {
		if (this.#closed) return
		this.#closed = true
		if (this.#bound) this.#closeSocket()
	}

	#closeSocket(): void {
		try {
			this.#socket.close()
		} catch (err) {
			this.#options.log('debug', `Could not close UDP socket: ${errorMessage(err)}`)
		}
	}

	#receive(datagram: Buffer, remote: RemoteInfo): void {
		if (this.#closed) return
		if (!this.#addresses.has(remote.address)) {
			this.#options.log(
				'debug',
				`UDP message received: ${datagram.toString('latin1')} from unrecognised host: ${remote.address}:${remote.port}`,
			)
			return
		}
		for (const text of messagesInDatagram(datagram)) {
			try {
				this.#options.onMessage(parseMessage(text))
			} catch (err) {
				// This runs in the socket's message listener, where a throw would end the module's process
				this.#options.log('error', `Could not handle UDP message ${text}: ${errorMessage(err)}`)
			}
		}
	}
}
