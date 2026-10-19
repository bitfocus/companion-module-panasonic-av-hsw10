import type { DropdownChoice, LogLevel } from '@companion-module/base'
import { unhandledOption } from './utils.js'

export enum LoggerLevel {
	Error = 0,
	Warning = 1,
	Information = 2,
	Debug = 3,
	Console = 4,
}

export const loggerLevelChoices = [
	{ id: LoggerLevel.Error, label: 'Error' },
	{ id: LoggerLevel.Warning, label: 'Warning' },
	{ id: LoggerLevel.Information, label: 'Information' },
	{ id: LoggerLevel.Debug, label: 'Debug' },
	{ id: LoggerLevel.Console, label: 'Console' },
] as const satisfies DropdownChoice<LoggerLevel>[]

/** The level of each of Companion's log levels */
const COMPANION_LEVELS: Record<LogLevel, LoggerLevel> = {
	error: LoggerLevel.Error,
	warn: LoggerLevel.Warning,
	info: LoggerLevel.Information,
	debug: LoggerLevel.Debug,
}

/** Where messages below the console level are written: the module instance */
export interface LogTarget {
	log(level: LogLevel, message: string): void
}

export type LogData = string | object | boolean | number

/** Objects are stringified, other data types coerced to string. An Error gives its message, which JSON drops */
function stringify(data: LogData): string {
	if (data instanceof Error) return data.message
	return typeof data === 'object' ? JSON.stringify(data) : data.toString()
}

/**
 * Utility class to manage logging constrained to specified level
 * @param target Module instance
 * @param logLevel Minimum Log Level to action, others are discarded
 *
 */

export class Logger {
	readonly #target: LogTarget
	readonly #minLogLevel: LoggerLevel

	constructor(target: LogTarget, logLevel: LoggerLevel = LoggerLevel.Information) {
		this.#target = target
		this.#minLogLevel = logLevel
	}

	/**
	 * @param level Level of message to be logged
	 * @param data Data to be logged
	 * @returns True if actioned
	 */

	public log(level: LoggerLevel, data: LogData): boolean {
		if (level > this.#minLogLevel) return false
		const message = stringify(data)
		switch (level) {
			case LoggerLevel.Console:
				console.log(message)
				break
			case LoggerLevel.Error:
				this.#target.log('error', message)
				break
			case LoggerLevel.Warning:
				this.#target.log('warn', message)
				break
			case LoggerLevel.Information:
				this.#target.log('info', message)
				break
			case LoggerLevel.Debug:
				this.#target.log('debug', message)
				break
			default:
				return unhandledOption(level, false)
		}
		return true
	}

	/**
	 * Log at one of Companion's levels, for code that knows nothing of this logger
	 */
	public logAt(level: LogLevel, data: LogData): boolean {
		return this.log(COMPANION_LEVELS[level], data)
	}

	/**
	 * Log to Console
	 */
	public console(data: LogData): boolean {
		return this.log(LoggerLevel.Console, data)
	}

	/**
	 * Log at debug level
	 */
	public debug(data: LogData): boolean {
		return this.log(LoggerLevel.Debug, data)
	}

	/**
	 * Log at info level
	 */
	public info(data: LogData): boolean {
		return this.log(LoggerLevel.Information, data)
	}

	/**
	 * Log at warning level
	 */
	public warn(data: LogData): boolean {
		return this.log(LoggerLevel.Warning, data)
	}

	/**
	 * Log at error level
	 */
	public error(data: LogData): boolean {
		return this.log(LoggerLevel.Error, data)
	}
}
