import { DropdownChoice, InstanceBase } from '@companion-module/base'
import { type ModuleConfig } from './config.js'

export enum LoggerLevel {
	Error = 0,
	Warning = 1,
	Information = 2,
	Debug = 3,
	Console = 4,
}

export const loggerLevelChoices: DropdownChoice[] = [
	{ id: LoggerLevel.Error, label: 'Error' },
	{ id: LoggerLevel.Warning, label: 'Warning' },
	{ id: LoggerLevel.Information, label: 'Information' },
	{ id: LoggerLevel.Debug, label: 'Debug' },
	{ id: LoggerLevel.Console, label: 'Console' },
]

/**
 * Utility class to manage logging constrained to specified level
 * @param self Module instance
 * @param logLevel Minimum Log Level to action, others are discarded
 *
 */

export class Logger {
	private _self!: InstanceBase<ModuleConfig>
	#minLogLevel: LoggerLevel = LoggerLevel.Console

	constructor(self: InstanceBase<ModuleConfig>, logLevel: LoggerLevel = LoggerLevel.Information) {
		this._self = self
		this.#minLogLevel = logLevel
	}

	/**
	 * @param level Level of message to be logged
	 * @param data Data to be logged. Objects stringified, other data types coerced to string
	 * @returns True if actioned
	 */

	public log(level: LoggerLevel, data: string | object | boolean | number): boolean {
		const logData = typeof data === 'object' ? JSON.stringify(data) : data.toString()
		if (level > this.#minLogLevel) return false
		if (level === LoggerLevel.Console) {
			console.log(logData)
		} else {
			const logLevel =
				level === LoggerLevel.Error
					? 'error'
					: level === LoggerLevel.Warning
						? 'warn'
						: level === LoggerLevel.Information
							? 'info'
							: 'debug'
			this._self.log(logLevel, logData)
		}
		return true
	}

	/**
	 * Log to Console
	 */
	public console(data: string | object | boolean | number): boolean {
		return this.log(LoggerLevel.Console, data)
	}

	/**
	 * Log at debug level
	 */
	public debug(data: string | object | boolean | number): boolean {
		return this.log(LoggerLevel.Debug, data)
	}

	/**
	 * Log at info level
	 */
	public info(data: string | object | boolean | number): boolean {
		return this.log(LoggerLevel.Information, data)
	}

	/**
	 * Log at warning level
	 */
	public warn(data: string | object | boolean | number): boolean {
		return this.log(LoggerLevel.Warning, data)
	}

	/**
	 * Log at error level
	 */
	public error(data: string | object | boolean | number): boolean {
		return this.log(LoggerLevel.Error, data)
	}
}
