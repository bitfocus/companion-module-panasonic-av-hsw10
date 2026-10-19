import { setTimeout as sleep } from 'node:timers/promises'
import { InstanceStatus, type LogLevel } from '@companion-module/base'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { encodeMessage, SwitcherConnection, WATCHDOG_INTERVALS, type ConnectionTiming } from '../connection.js'
import { Messages } from '../enums.js'
import type { ParsedMessage } from '../parseMsg.js'
import { closedPort, FakeSwitcher } from './fakeSwitcher.js'

let fake: FakeSwitcher
const connections: SwitcherConnection[] = []

beforeEach(async () => {
	fake = new FakeSwitcher()
	await fake.listen()
})

afterEach(async () => {
	for (const connection of connections.splice(0)) connection.destroy()
	await fake.close()
})

function create(timing: Partial<ConnectionTiming> = {}, port = fake.port) {
	const log = vi.fn<(level: LogLevel, message: string) => void>()
	const connection = new SwitcherConnection({
		host: '127.0.0.1',
		port,
		log,
		timing: { messageInterval: 5, keepaliveInterval: 60000, reconnectInterval: 50, ...timing },
	})
	connections.push(connection)
	const statuses: [InstanceStatus, string | null][] = []
	const messages: ParsedMessage[] = []
	const connected = vi.fn()
	connection.on('status', (status, message) => statuses.push([status, message]))
	connection.on('message', (message) => messages.push(message))
	connection.on('connected', connected)
	return { connection, log, statuses, messages, connected }
}

async function connected(timing: Partial<ConnectionTiming> = {}) {
	const created = create(timing)
	created.connection.connect()
	await vi.waitFor(() => expect(created.connection.isConnected).toBe(true))
	return created
}

describe('encodeMessage', () => {
	it('frames the command and its arguments', () => {
		expect(encodeMessage(Messages.BusSettingControl, ['01', '05'])).toBe('\x02SBUS:01:05\x03')
		expect(encodeMessage(Messages.BusStatusQuery, ['113'])).toBe('\x02QBSC:113\x03')
	})
})

describe('SwitcherConnection', () => {
	it('reports connecting, then ok, and says when it is connected', async () => {
		const { statuses, connected: onConnected } = await connected()
		expect(statuses).toEqual([
			[InstanceStatus.Connecting, `Connecting to 127.0.0.1:${fake.port}`],
			[InstanceStatus.Ok, null],
		])
		expect(onConnected).toHaveBeenCalledOnce()
	})

	it('sends each message framed, spaced by the message interval', async () => {
		const { connection } = await connected({ messageInterval: 30 })
		await Promise.all([
			connection.send(Messages.BusSettingControl, ['01', '05']),
			connection.send(Messages.CutTransitionSet, ['00']),
			connection.send(Messages.BusStatusQuery, ['02']),
		])
		await vi.waitFor(() => expect(fake.received).toHaveLength(3))
		expect(fake.received.map((m) => m.fields)).toEqual([
			['SBUS', '01', '05'],
			['SCUT', '00'],
			['QBSC', '02'],
		])
		const [first, second, third] = fake.received.map((m) => m.at)
		// Timers may fire a millisecond early
		expect(second - first).toBeGreaterThanOrEqual(28)
		expect(third - second).toBeGreaterThanOrEqual(28)
	})

	it('refuses to send while not connected', async () => {
		const { connection } = create()
		await expect(connection.send(Messages.CutTransitionSet, ['00'])).rejects.toThrow('Not connected')
	})

	it('reads the replies, however they are split', async () => {
		const { connection, messages } = await connected()
		await connection.send(Messages.BusSettingControl, ['113', '148'])
		await vi.waitFor(() => expect(messages).toHaveLength(1))
		fake.broadcast('\x02ABSC:0')
		await sleep(20)
		fake.broadcast('2:05\x03junk\x02EROR:02\x03')
		await vi.waitFor(() => expect(messages).toHaveLength(3))
		expect(messages).toEqual([
			{ type: 'busSource', command: Messages.BusSettingResponse, bus: '113', source: '148' },
			{ type: 'busSource', command: Messages.BusStatusResponse, bus: '02', source: '05' },
			{ type: 'error', detail: '02', text: 'EROR:02' },
		])
	})

	it('drops a message whose signal aborts before its turn, and sends the rest', async () => {
		const { connection } = await connected({ messageInterval: 50 })
		const controller = new AbortController()
		const first = connection.send(Messages.CutTransitionSet, ['00'])
		const aborted = connection.send(Messages.CutTransitionSet, ['01'], controller.signal)
		const last = connection.send(Messages.CutTransitionSet, ['04'])
		controller.abort(new Error('user aborted'))
		await expect(aborted).rejects.toThrow('user aborted')
		await Promise.all([first, last])
		await vi.waitFor(() => expect(fake.messages('SCUT')).toHaveLength(2))
		expect(fake.messages('SCUT')).toEqual([
			['SCUT', '00'],
			['SCUT', '04'],
		])
	})

	it('drops everything still queued when the connection closes, without leaving it pending', async () => {
		const { connection } = await connected({ messageInterval: 200 })
		const first = connection.send(Messages.CutTransitionSet, ['00'])
		const queued = connection.send(Messages.CutTransitionSet, ['01'])
		await first
		await vi.waitFor(() => expect(fake.messages('SCUT')).toHaveLength(1))
		fake.dropConnections()
		await expect(queued).rejects.toThrow('Connection to switcher closed')
		await sleep(250)
		expect(fake.messages('SCUT')).toEqual([['SCUT', '00']])
	})

	it('queries PGM to keep an idle connection open, and waits again after each message', async () => {
		const { connection } = await connected({ keepaliveInterval: 300 })
		await sleep(150)
		await connection.send(Messages.CutTransitionSet, ['00'])
		await sleep(200)
		// More than 300 ms since connecting, but only 200 since the last message
		expect(fake.messages('QBSC')).toEqual([])
		await vi.waitFor(() => expect(fake.messages('QBSC')).toEqual([['QBSC', '01']]))
		await vi.waitFor(() => expect(fake.messages('QBSC')).toHaveLength(2))
	})

	// Before, the module opened a new socket of its own on top of TCPHelper's reconnection
	it('reconnects once when the switcher closes the connection', async () => {
		const { statuses, connected: onConnected } = await connected({ reconnectInterval: 50 })
		fake.dropConnections()
		await vi.waitFor(() => expect(onConnected).toHaveBeenCalledTimes(2))
		await sleep(50 * 6)
		expect(fake.connections).toBe(2)
		expect(fake.openConnections).toBe(1)
		expect(onConnected).toHaveBeenCalledTimes(2)
		expect(statuses).toContainEqual([InstanceStatus.Disconnected, 'Connection closed by switcher'])
		expect(statuses.at(-1)).toEqual([InstanceStatus.Ok, null])
	})

	it('keeps trying a switcher that is off, logging the failure once rather than every retry', async () => {
		const { connection, log, statuses } = create({ reconnectInterval: 20 }, await closedPort())
		connection.connect()
		await vi.waitFor(() =>
			expect(log.mock.calls.filter(([, m]) => m.startsWith('Network error')).length).toBeGreaterThanOrEqual(4),
		)
		expect(log.mock.calls.filter(([level, m]) => level === 'error' && m.startsWith('Network error'))).toHaveLength(1)
		expect(statuses.filter(([status]) => status === InstanceStatus.ConnectionFailure)).toHaveLength(1)
	})

	it('reconnects to a switcher that has replied and then goes quiet', async () => {
		const { connection, log } = await connected({ keepaliveInterval: 60 })
		await connection.send(Messages.BusStatusQuery, ['01'])
		await vi.waitFor(() => expect(fake.received).toHaveLength(1))
		fake.answering = false
		await vi.waitFor(() => expect(fake.connections).toBe(2), { timeout: 60 * WATCHDOG_INTERVALS * 3 })
		expect(log).toHaveBeenCalledWith('warn', expect.stringMatching(/Nothing received from switcher for \d+ ms/))
	})

	it('does not reconnect to a switcher that never replies', async () => {
		fake.answering = false
		await connected({ keepaliveInterval: 30 })
		await sleep(30 * WATCHDOG_INTERVALS * 3)
		expect(fake.connections).toBe(1)
		expect(fake.messages('QBSC').length).toBeGreaterThan(2)
	})

	it('closes for good once destroyed', async () => {
		const { connection, connected: onConnected } = await connected({ reconnectInterval: 20 })
		connection.destroy()
		await vi.waitFor(() => expect(fake.openConnections).toBe(0))
		await sleep(100)
		expect(fake.connections).toBe(1)
		expect(onConnected).toHaveBeenCalledOnce()
		expect(() => connection.connect()).toThrow('destroyed')
	})
})
