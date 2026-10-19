import { setTimeout as sleep } from 'node:timers/promises'
import { InstanceStatus, type CompanionFeedbackDefinitions } from '@companion-module/base'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AvHsw10 from '../main.js'
import type { ModuleConfig } from '../config.js'
import { CrosspointControlBusSelection, CrosspointControlSourceSelection, Messages } from '../enums.js'
import { FeedbackId, type FeedbackSchema } from '../feedbacks.js'
import { closedPort, FakeSwitcher, switcherMessage } from './fakeSwitcher.js'
import { checkFeedback, feedbackValue } from './fixtures.js'
import { createContext, type HostContext } from './hostContext.js'

const UDP_PORT = 65000
const BUS_COUNT = Object.values(CrosspointControlBusSelection).length

let fake: FakeSwitcher
const instances: AvHsw10[] = []

beforeEach(async () => {
	fake = new FakeSwitcher()
	await fake.listen()
})

afterEach(async () => {
	for (const instance of instances.splice(0)) await instance.destroy()
	await fake.close()
})

function createInstance() {
	const context = createContext()
	const instance = new AvHsw10(context)
	const log = vi.spyOn(instance, 'log').mockImplementation(() => {})
	instances.push(instance)
	return { instance, context, log }
}

function config(overrides: Partial<ModuleConfig> = {}): ModuleConfig {
	return { host: '127.0.0.1', port: fake.port, portRecieve: UDP_PORT, verbose: false, ...overrides }
}

/** The feedback definitions last given to Companion, for their callbacks to be run against the real instance */
const definedFeedbacks = (context: HostContext) =>
	context.setFeedbackDefinitions.mock.calls.at(-1)?.[0] as CompanionFeedbackDefinitions<FeedbackSchema>

/** Waits for the connection, and for the switcher to have answered the query of every bus on connecting */
async function started(overrides: Partial<ModuleConfig> = {}) {
	const created = createInstance()
	await created.instance.init(config(overrides))
	await vi.waitFor(() => expect(created.context.updateStatus).toHaveBeenCalledWith(InstanceStatus.Ok, null))
	await vi.waitFor(() => expect(created.instance.state.getBusSource(CrosspointControlBusSelection.MV_16)).toBeDefined())
	await vi.waitFor(() => expect(created.context.sharedUdpSocketHandlers.size).toBe(1))
	return created
}

describe('starting', () => {
	it('queries every bus on connecting', async () => {
		fake.busSources.set('113', '148')
		const { instance } = await started()
		expect(fake.messages('QBSC').map(([, bus]) => bus)).toEqual(Object.values(CrosspointControlBusSelection))
		expect(fake.messages('QBSC')).toHaveLength(BUS_COUNT)
		expect(instance.state.getBusSource(CrosspointControlBusSelection.AUX1)).toBe(CrosspointControlSourceSelection.BLACK)
	})

	it('listens for UDP notifications on the configured port', async () => {
		const { context } = await started({ portRecieve: 65100 })
		expect(context.sharedUdpSocketJoin).toHaveBeenCalledExactlyOnceWith({ family: 'udp4', portNumber: 65100 })
	})

	it('reports a missing host or an unusable port as bad config, without connecting', async () => {
		const { instance, context } = createInstance()
		await instance.init(config({ host: '  ' }))
		expect(context.updateStatus).toHaveBeenLastCalledWith(InstanceStatus.BadConfig, 'No host')
		await instance.configUpdated(config({ port: 0 }))
		expect(context.updateStatus).toHaveBeenLastCalledWith(InstanceStatus.BadConfig, 'Invalid port 0')
		await instance.configUpdated(config({ portRecieve: 70000 }))
		expect(context.updateStatus).toHaveBeenLastCalledWith(
			InstanceStatus.BadConfig,
			'Invalid UDP destination port 70000',
		)
		await sleep(50)
		expect(fake.connections).toBe(0)
		expect(context.sharedUdpSocketJoin).not.toHaveBeenCalled()
		await expect(instance.sendMessage(Messages.CutTransitionSet, ['00'])).rejects.toThrow('Not connected')
	})
})

describe('bus source changes', () => {
	it('recheck only the feedbacks on the bus reported, and only when it changes', async () => {
		const { instance, context } = await started()
		const defs = definedFeedbacks(context)
		// As Companion runs the callbacks of the feedbacks on its buttons
		checkFeedback(defs, FeedbackId.BusSource, { bus: '01', source: '05' }, 'on-pgm')
		checkFeedback(defs, FeedbackId.BusSource, { bus: '02', source: '05' }, 'on-pvw')
		expect(feedbackValue(defs, FeedbackId.BusSourceValue, { bus: '01' }, 'value-pgm')).toEqual({
			crosspoint: '01',
			name: 'INPUT 1',
		})
		context.checkFeedbacks.mockClear()
		fake.broadcast(switcherMessage('ABSC', '01', '05'))
		fake.broadcast(switcherMessage('ABSC', '113', '06')) // a bus no feedback is on
		await vi.waitFor(() => expect(instance.state.getBusSource(CrosspointControlBusSelection.AUX1)).toBe('06'))
		expect(context.checkFeedbacksById).toHaveBeenCalledExactlyOnceWith(['on-pgm', 'value-pgm'])
		expect(checkFeedback(defs, FeedbackId.BusSource, { bus: '01', source: '05' }, 'on-pgm')).toBe(true)
		expect(feedbackValue(defs, FeedbackId.BusSourceValue, { bus: '01' }, 'value-pgm')).toEqual({
			crosspoint: '05',
			name: 'INPUT 5',
		})
		fake.broadcast(switcherMessage('ABSC', '01', '05'))
		await sleep(50)
		expect(context.checkFeedbacksById).toHaveBeenCalledOnce()
		expect(context.checkFeedbacks).not.toHaveBeenCalled()
	})

	it('come from the UDP notifications the switcher sends too', async () => {
		const { instance, context } = await started()
		checkFeedback(definedFeedbacks(context), FeedbackId.BusSource, { bus: '02', source: '09' }, 'on-pvw')
		context.deliverUdp(UDP_PORT, switcherMessage('ABSC', '02', '09'), '127.0.0.1')
		context.deliverUdp(UDP_PORT, switcherMessage('ABSC', '113', '09'), '10.9.9.9')
		expect(instance.state.getBusSource(CrosspointControlBusSelection.PVW)).toBe('09')
		expect(instance.state.getBusSource(CrosspointControlBusSelection.AUX1)).toBe('01')
		expect(context.checkFeedbacksById).toHaveBeenCalledExactlyOnceWith(['on-pvw'])
	})

	it('follow a Bus Source action, from the reply the switcher sends', async () => {
		const { instance } = await started()
		await instance.sendMessage(Messages.BusSettingControl, ['113', '147'])
		await vi.waitFor(() => expect(instance.state.getBusSource(CrosspointControlBusSelection.AUX1)).toBe('147'))
		expect(fake.messages('SBUS')).toEqual([['SBUS', '113', '147']])
	})
})

describe('switcher errors', () => {
	it('are logged with what they mean', async () => {
		const { log } = await started()
		fake.broadcast(switcherMessage('EROR', '01') + switcherMessage('EROR', '02') + switcherMessage('EROR', '09'))
		await vi.waitFor(() =>
			expect(log).toHaveBeenCalledWith('warn', 'Error received with invalid error details. EROR:09'),
		)
		expect(log).toHaveBeenCalledWith('warn', 'Error, Parameter out of range')
		expect(log).toHaveBeenCalledWith('warn', 'Syntax Error')
	})
})

describe('changing the config', () => {
	// Reports only recheck the feedbacks on their bus, and the states are cleared, so without a full check each feedback
	// would keep its state until its bus was next reported
	it('rechecks every bus source feedback, so none keeps the state it had', async () => {
		const { instance, context } = await started()
		const defs = definedFeedbacks(context)
		expect(checkFeedback(defs, FeedbackId.BusSource, { bus: '01', source: '01' }, 'on-pgm')).toBe(true)
		expect(feedbackValue(defs, FeedbackId.BusSourceValue, { bus: '01' }, 'value-pgm')).not.toBeNull()
		const states: unknown[] = []
		context.checkFeedbacks.mockClear()
		context.checkFeedbacks.mockImplementation((feedbackIds: FeedbackId[]) => {
			if (feedbackIds.includes(FeedbackId.BusSource)) {
				states.push(checkFeedback(defs, FeedbackId.BusSource, { bus: '01', source: '01' }, 'on-pgm'))
			}
			if (feedbackIds.includes(FeedbackId.BusSourceValue)) {
				states.push(feedbackValue(defs, FeedbackId.BusSourceValue, { bus: '01' }, 'value-pgm'))
			}
		})
		await instance.configUpdated(config({ port: await closedPort() }))
		expect(context.checkFeedbacks).toHaveBeenCalledExactlyOnceWith([FeedbackId.BusSource, FeedbackId.BusSourceValue])
		expect(states).toEqual([false, null])
	})

	// Before, the old connection was left open, still reporting
	it('closes the connection and the UDP listener when the host is removed', async () => {
		const { instance, context } = await started()
		await instance.configUpdated(config({ host: '' }))
		await vi.waitFor(() => expect(fake.openConnections).toBe(0))
		await vi.waitFor(() => expect(context.sharedUdpSocketHandlers.size).toBe(0))
		expect(context.updateStatus).toHaveBeenLastCalledWith(InstanceStatus.BadConfig, 'No host')
		context.deliverUdp(UDP_PORT, switcherMessage('ABSC', '01', '05'), '127.0.0.1')
		expect(instance.state.getBusSource(CrosspointControlBusSelection.PGM)).toBeUndefined()
	})

	it('opens a single new connection and UDP listener', async () => {
		const { instance, context } = await started()
		await instance.configUpdated(config({ portRecieve: 65001 }))
		await vi.waitFor(() => expect(fake.connections).toBe(2))
		await vi.waitFor(() => expect(context.sharedUdpSocketHandlers.size).toBe(1))
		await sleep(100)
		expect(fake.openConnections).toBe(1)
		expect(context.sharedUdpSocketLeave).toHaveBeenCalledOnce()
		expect(context.sharedUdpSocketJoin.mock.calls.map(([join]) => join.portNumber)).toEqual([UDP_PORT, 65001])
	})

	// A config saved twice in quick succession reaches the module before Companion has answered the first UDP join
	it('replaces a UDP listener that is still binding', async () => {
		const { instance, context } = createInstance()
		context.holdJoins = true
		await instance.init(config())
		await instance.configUpdated(config())
		context.releaseJoins()
		await vi.waitFor(() => expect(context.sharedUdpSocketLeave).toHaveBeenCalledOnce())
		await vi.waitFor(() => expect(context.sharedUdpSocketHandlers.size).toBe(1))
		expect(context.updateStatus).not.toHaveBeenCalledWith(InstanceStatus.UnknownError, expect.anything())
	})
})

describe('destroy', () => {
	it('closes the connection and the UDP listener', async () => {
		const { instance, context } = await started()
		await instance.destroy()
		await vi.waitFor(() => expect(fake.openConnections).toBe(0))
		await vi.waitFor(() => expect(context.sharedUdpSocketHandlers.size).toBe(0))
		expect(context.updateStatus).toHaveBeenLastCalledWith(InstanceStatus.Disconnected, null)
	})
})
