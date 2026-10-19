import { afterEach, describe, expect, it, vi } from 'vitest'
import { Logger, LoggerLevel } from '../logger.js'

afterEach(() => {
	vi.restoreAllMocks()
})

function logger(level?: LoggerLevel) {
	const log = vi.fn()
	return { log, logger: new Logger({ log }, level) }
}

describe('Logger', () => {
	it('writes each level to the instance with its Companion level', () => {
		const { log, logger: target } = logger(LoggerLevel.Debug)
		target.error('e')
		target.warn('w')
		target.info('i')
		target.debug('d')
		expect(log.mock.calls).toEqual([
			['error', 'e'],
			['warn', 'w'],
			['info', 'i'],
			['debug', 'd'],
		])
	})

	it('drops anything below its level', () => {
		const { log, logger: target } = logger()
		expect(target.debug('d')).toBe(false)
		expect(target.info('i')).toBe(true)
		expect(log).toHaveBeenCalledExactlyOnceWith('info', 'i')
	})

	it('writes the console level to the console', () => {
		const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})
		const { log, logger: target } = logger(LoggerLevel.Console)
		target.console({ a: 1 })
		expect(consoleLog).toHaveBeenCalledExactlyOnceWith('{"a":1}')
		expect(log).not.toHaveBeenCalled()
	})

	// JSON.stringify gives {} for an Error, as its message is not enumerable
	it('logs the message of an Error', () => {
		const { log, logger: target } = logger()
		target.error(new Error('connect ECONNREFUSED'))
		expect(log).toHaveBeenCalledExactlyOnceWith('error', 'connect ECONNREFUSED')
	})

	it('maps Companion levels for code that knows nothing of it', () => {
		const { log, logger: target } = logger(LoggerLevel.Information)
		expect(target.logAt('warn', 'w')).toBe(true)
		expect(target.logAt('debug', 'd')).toBe(false)
		expect(log).toHaveBeenCalledExactlyOnceWith('warn', 'w')
	})
})
