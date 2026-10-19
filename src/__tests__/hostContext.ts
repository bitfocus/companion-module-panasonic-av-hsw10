import { vi } from 'vitest'

/** As Companion hands a shared UDP socket a datagram */
interface SharedUdpSocketHandler {
	receiveSocketMessage(message: {
		handleId: string
		portNumber: number
		message: Buffer
		source: { address: string; family: 'IPv4'; port: number; size: number }
	}): void
}

/**
 * What InstanceBase needs from the host, with everything it forwards to Companion mocked. Shared UDP sockets join
 * straight away unless {@link HostContext.holdJoins} is set.
 */
export class HostContext {
	readonly id = 'test-instance'
	readonly _isInstanceContext = true
	readonly label = 'test'
	readonly upgradeScripts = []
	readonly saveConfig = vi.fn()
	readonly updateStatus = vi.fn()
	readonly oscSend = vi.fn()
	readonly recordAction = vi.fn()
	readonly setActionDefinitions = vi.fn()
	readonly subscribeActions = vi.fn()
	readonly unsubscribeActions = vi.fn()
	readonly setFeedbackDefinitions = vi.fn()
	readonly unsubscribeFeedbacks = vi.fn()
	readonly checkFeedbacks = vi.fn()
	readonly checkAllFeedbacks = vi.fn()
	readonly checkFeedbacksById = vi.fn()
	readonly setPresetDefinitions = vi.fn()
	readonly setCompositeElementDefinitions = vi.fn()
	readonly setVariableDefinitions = vi.fn()
	readonly setVariableValues = vi.fn()
	readonly getVariableValue = vi.fn()
	readonly sharedUdpSocketHandlers = new Map<string, SharedUdpSocketHandler>()
	/** Hold each join until {@link releaseJoins}, as Companion takes a moment to answer */
	holdJoins = false
	readonly #pendingJoins: (() => void)[] = []
	#joins = 0
	readonly sharedUdpSocketJoin = vi.fn(async (_msg: { family: 'udp4' | 'udp6'; portNumber: number }) => {
		const handleId = `udp-${++this.#joins}`
		if (this.holdJoins) await new Promise<void>((resolve) => this.#pendingJoins.push(resolve))
		return handleId
	})
	readonly sharedUdpSocketLeave = vi.fn(async (_msg: { handleId: string }) => {})
	readonly sharedUdpSocketSend = vi.fn()

	releaseJoins(): void {
		for (const resolve of this.#pendingJoins.splice(0)) resolve()
	}

	/** Delivers a datagram to every shared socket bound to the port */
	deliverUdp(portNumber: number, message: string, address: string): void {
		for (const [handleId, handler] of this.sharedUdpSocketHandlers) {
			const joined = this.sharedUdpSocketJoin.mock.calls[Number(handleId.slice('udp-'.length)) - 1][0]
			if (joined.portNumber !== portNumber) continue
			handler.receiveSocketMessage({
				handleId,
				portNumber,
				message: Buffer.from(message, 'latin1'),
				source: { address, family: 'IPv4', port: 50000, size: message.length },
			})
		}
	}
}

export function createContext(): HostContext {
	return new HostContext()
}
