import { InstanceBase, InstanceStatus, type LogLevel, type SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, validPort, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions, type VariablesSchema } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions, type ActionSchema } from './actions.js'
import { FeedbackId, UpdateFeedbacks, type FeedbackSchema } from './feedbacks.js'
import { CrosspointControlBusSelection, ErrorDetails, Messages } from './enums.js'
import { Logger, LoggerLevel } from './logger.js'
import type { ParsedMessage } from './parseMsg.js'
import { SwitcherConnection } from './connection.js'
import { SwitcherState } from './switcher.js'
import { FeedbackSubscriptions } from './subscriptions.js'
import { UdpListener } from './udp.js'
import { errorMessage, unhandledOption } from './utils.js'

export type ModuleTypes = {
	config: ModuleConfig
	secrets: undefined
	actions: ActionSchema
	feedbacks: FeedbackSchema
	variables: VariablesSchema
}

export { UpgradeScripts }

function errorDetailText(detail: ErrorDetails | undefined, text: string): string {
	switch (detail) {
		case ErrorDetails.OutOfRangeParameter:
			return 'Error, Parameter out of range'
		case ErrorDetails.SyntaxError:
			return 'Syntax Error'
		case undefined:
			return `Error received with invalid error details. ${text}`
		default:
			return unhandledOption(detail, `Error received: ${text}`)
	}
}

export default class AvHsw10 extends InstanceBase<ModuleTypes> {
	config!: ModuleConfig // Setup in init()
	public logger: Logger = new Logger(this)
	readonly state = new SwitcherState()
	/** The Bus Source and Bus Source (Value) feedbacks in use, by bus */
	readonly busSourceFeedbacks = new FeedbackSubscriptions<CrosspointControlBusSelection>()
	#connection: SwitcherConnection | undefined
	#udp: UdpListener | undefined

	constructor(internal: unknown) {
		super(internal)
		process.title = `companion_AvHSw10_${this.label}`
	}

	async init(config: ModuleConfig): Promise<void> {
		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
		await this.configUpdated(config)
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = config
		process.title = `companion_AvHSw10_${this.label}`
		this.logger = new Logger(this, config.verbose ? LoggerLevel.Console : LoggerLevel.Information)
		this.logger.debug(`Config Updated: ${JSON.stringify(config)}`)
		this.#close()
		// The switcher itself may have changed
		this.state.resetBusSources()
		// Reports only recheck the feedbacks on their bus, so without this each would keep the state it had until its bus
		// was next reported, if it ever is
		this.checkFeedbacks(FeedbackId.BusSource, FeedbackId.BusSourceValue)
		this.#open()
	}

	// When module gets deleted
	async destroy(): Promise<void> {
		this.logger.debug(`destroy ${this.id}:${this.label}`)
		this.#close()
		this.updateStatus(InstanceStatus.Disconnected)
	}

	// Return config fields for web config
	public getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	/**
	 * Queues a message for the switcher
	 * @param signal an action's context.signal, so a message the user no longer wants is dropped before it is sent
	 * @throws if not connected, or the message is not sent
	 */
	public async sendMessage(command: Messages, args: readonly string[] = [], signal?: AbortSignal): Promise<void> {
		if (this.#connection === undefined) throw new Error('Not connected to switcher')
		await this.#connection.send(command, args, signal)
	}

	#open(): void {
		const host = this.config.host?.trim()
		const port = validPort(this.config.port)
		const udpPort = validPort(this.config.portRecieve)
		if (!host) {
			this.updateStatus(InstanceStatus.BadConfig, 'No host')
			this.logger.error('No host defined')
			return
		}
		if (port === undefined) {
			this.updateStatus(InstanceStatus.BadConfig, `Invalid port ${String(this.config.port)}`)
			return
		}
		if (udpPort === undefined) {
			this.updateStatus(InstanceStatus.BadConfig, `Invalid UDP destination port ${String(this.config.portRecieve)}`)
			return
		}
		const log = (level: LogLevel, message: string): void => {
			this.logger.logAt(level, message)
		}
		const connection = new SwitcherConnection({ host, port, log })
		connection.on('status', (status, message) => this.updateStatus(status, message))
		connection.on('connected', () => this.#queryEachBus())
		connection.on('message', (message) => this.#onMessage(message))
		this.#connection = connection
		connection.connect()
		try {
			this.#udp = new UdpListener({
				host,
				port: udpPort,
				createSocket: (callback) => this.createSharedUdpSocket('udp4', callback),
				onMessage: (message) => this.#onMessage(message),
				log,
			})
		} catch (err) {
			this.updateStatus(InstanceStatus.UnknownError, `Error setting up UDP Listener: ${errorMessage(err)}`)
		}
	}

	#close(): void {
		this.#connection?.destroy()
		this.#connection = undefined
		this.#udp?.close()
		this.#udp = undefined
	}

	#queryEachBus(): void {
		for (const bus of Object.values(CrosspointControlBusSelection)) {
			this.sendMessage(Messages.BusStatusQuery, [bus]).catch((err) =>
				this.logger.debug(`Bus ${bus} not queried: ${errorMessage(err)}`),
			)
		}
	}

	#onMessage(message: ParsedMessage): void {
		switch (message.type) {
			case 'busSource':
				this.logger.console(`Message type: ${message.command}. Bus ${message.bus}, source ${message.source}`)
				if (this.state.setBusSource(message.bus, message.source)) this.#checkBusSourceFeedbacks(message.bus)
				break
			case 'error':
				this.logger.warn(errorDetailText(message.detail, message.text))
				break
			case 'ignored':
				this.logger.console(`Message type: ${message.command}`)
				break
			case 'invalid':
				this.logger.debug(`Message not recognised: ${message.text}`)
				break
			default:
				unhandledOption(message, undefined)
		}
	}

	/** Rechecks the feedbacks reading a bus, if any are */
	#checkBusSourceFeedbacks(bus: CrosspointControlBusSelection): void {
		const ids = this.busSourceFeedbacks.feedbacksFor(bus)
		if (ids.length > 0) this.checkFeedbacksById(...ids)
	}

	private updateActions(): void {
		UpdateActions(this)
	}

	private updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	private updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}
}
