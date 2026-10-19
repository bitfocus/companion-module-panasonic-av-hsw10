import { setTimeout as sleep } from 'node:timers/promises'
import type { LogLevel } from '@companion-module/base'
import { describe, expect, it, vi } from 'vitest'
import AvHsw10 from '../main.js'
import { Messages } from '../enums.js'
import type { ParsedMessage } from '../parseMsg.js'
import { UdpListener } from '../udp.js'
import { createContext } from './hostContext.js'

const PORT = 65000

/** A listener on a real shared socket, which only a module instance can create */
function listen(host: string, resolve?: (hostname: string) => Promise<string[]>, holdJoins = false) {
	const context = createContext()
	context.holdJoins = holdJoins
	const instance = new AvHsw10(context)
	const messages: ParsedMessage[] = []
	const log = vi.fn<(level: LogLevel, message: string) => void>()
	const listener = new UdpListener({
		host,
		port: PORT,
		createSocket: (callback) => instance.createSharedUdpSocket('udp4', callback),
		onMessage: (message) => messages.push(message),
		log,
		resolve,
	})
	return { context, listener, messages, log }
}

const absc = (bus: string, source: string) => `\x02ABSC:${bus}:${source}\x03`

describe('UdpListener', () => {
	it('takes the messages the switcher sends, every one in a datagram, and none from anywhere else', async () => {
		const { context, messages } = listen('10.0.0.5')
		await vi.waitFor(() => expect(context.sharedUdpSocketHandlers.size).toBe(1))
		expect(context.sharedUdpSocketJoin).toHaveBeenCalledExactlyOnceWith({ family: 'udp4', portNumber: PORT })
		context.deliverUdp(PORT, absc('01', '05') + absc('113', '148'), '10.0.0.5')
		context.deliverUdp(PORT, absc('02', '06'), '10.0.0.6')
		expect(messages).toEqual([
			{ type: 'busSource', command: Messages.BusStatusResponse, bus: '01', source: '05' },
			{ type: 'busSource', command: Messages.BusStatusResponse, bus: '113', source: '148' },
		])
	})

	// A datagram's sender is always an address, so before, nothing was taken when the config held a hostname
	it('takes the messages from the addresses of a hostname', async () => {
		const resolve = vi.fn(async () => ['10.0.0.5', '10.0.0.7'])
		const { context, messages } = listen('switcher.local', resolve)
		await vi.waitFor(() => expect(context.sharedUdpSocketHandlers.size).toBe(1))
		await sleep(10)
		context.deliverUdp(PORT, absc('01', '05'), '10.0.0.7')
		expect(resolve).toHaveBeenCalledExactlyOnceWith('switcher.local')
		expect(messages).toHaveLength(1)
	})

	it('takes nothing from a hostname that does not resolve, and says so', async () => {
		const { context, messages, log } = listen('nowhere.invalid', async () => {
			throw new Error('ENOTFOUND')
		})
		await vi.waitFor(() =>
			expect(log).toHaveBeenCalledWith('warn', expect.stringMatching(/Could not resolve.*ENOTFOUND/)),
		)
		context.deliverUdp(PORT, absc('01', '05'), '10.0.0.5')
		expect(messages).toEqual([])
	})

	// SharedUdpSocket.close throws until Companion has answered the join. Before, that throw skipped creating the new
	// listener, leaving the module with none
	it('can be closed while the socket is still binding, and leaves once it is bound', async () => {
		const { context, listener, messages } = listen('10.0.0.5', undefined, true)
		expect(() => listener.close()).not.toThrow()
		context.releaseJoins()
		await vi.waitFor(() => expect(context.sharedUdpSocketLeave).toHaveBeenCalledExactlyOnceWith({ handleId: 'udp-1' }))
		context.deliverUdp(PORT, absc('01', '05'), '10.0.0.5')
		expect(messages).toEqual([])
	})

	it('leaves the shared socket once closed, and takes nothing more', async () => {
		const { context, listener, messages } = listen('10.0.0.5')
		await vi.waitFor(() => expect(context.sharedUdpSocketHandlers.size).toBe(1))
		listener.close()
		listener.close()
		context.deliverUdp(PORT, absc('01', '05'), '10.0.0.5')
		await vi.waitFor(() => expect(context.sharedUdpSocketHandlers.size).toBe(0))
		expect(context.sharedUdpSocketLeave).toHaveBeenCalledOnce()
		expect(messages).toEqual([])
	})

	it('can be closed after the socket failed to bind', async () => {
		const context = createContext()
		context.sharedUdpSocketJoin.mockRejectedValueOnce(new Error('port in use'))
		const instance = new AvHsw10(context)
		const log = vi.fn()
		const listener = new UdpListener({
			host: '10.0.0.5',
			port: PORT,
			createSocket: (callback) => instance.createSharedUdpSocket('udp4', callback),
			onMessage: () => {},
			log,
		})
		await vi.waitFor(() => expect(log).toHaveBeenCalledWith('error', 'Error from UDP Listener: port in use'))
		expect(() => listener.close()).not.toThrow()
		expect(context.sharedUdpSocketLeave).not.toHaveBeenCalled()
	})
})
