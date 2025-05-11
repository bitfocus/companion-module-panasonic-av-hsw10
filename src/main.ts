import {
	InstanceBase,
	runEntrypoint,
	InstanceStatus,
	SomeCompanionConfigField,
	TCPHelper,
} from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import PQueue from 'p-queue'

const MESSAGE_INTERVAL = 16
//const CONNECTION_TIMEOUT = 20000

export class AvHsw10 extends InstanceBase<ModuleConfig> {
	config!: ModuleConfig // Setup in init()
	socket!: TCPHelper
	queue = new PQueue({ concurrency: 1, interval: MESSAGE_INTERVAL, intervalCap: 1 })
	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = config

		this.updateStatus(InstanceStatus.Ok)

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
	}
	// When module gets deleted
	async destroy(): Promise<void> {
		this.log('debug', `destroy ${this.id}:${this.label}`)
		this.queue.clear()
		if (this.socket) this.socket.destroy()
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.queue.clear()
		this.config = config
	}

	// Return config fields for web config
	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}
}

runEntrypoint(AvHsw10, UpgradeScripts)
