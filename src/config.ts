import { Regex, type SomeCompanionConfigField } from '@companion-module/base'

export const DEFAULT_PORT = 62000
export const DEFAULT_UDP_PORT = 65000

/** The keys are saved in every existing config, misspelt `portRecieve` included */
export type ModuleConfig = {
	host: string
	/** TCP port on the switcher, for control */
	port: number
	/** UDP port Companion listens on, for the bus status notifications the switcher sends */
	portRecieve: number
	verbose: boolean
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Hostname / IP',
			width: 8,
			regex: Regex.HOSTNAME,
			default: '192.168.0.8',
		},
		{
			type: 'number',
			id: 'port',
			label: 'Port',
			width: 4,
			min: 1,
			max: 65535,
			default: DEFAULT_PORT,
		},
		{
			type: 'number',
			id: 'portRecieve',
			label: 'UDP Destination Port',
			width: 4,
			min: 1,
			max: 65535,
			default: DEFAULT_UDP_PORT,
			tooltip:
				'Companion will bind to this port on 0.0.0.0. This must match the Destination Port in the device configuration',
		},
		{
			type: 'checkbox',
			id: 'verbose',
			label: 'Verbose Logs',
			width: 4,
			default: false,
		},
		{
			type: 'static-text',
			id: 'info',
			label: '',
			value: 'The AV-HSW10 can support a maximum of 20 simultaneous connections for external control',
			width: 8,
		},
	]
}

/** The port, or undefined if it is not one TCP or UDP can use. A saved config isn't checked against its field's min and max */
export function validPort(port: unknown): number | undefined {
	return typeof port === 'number' && Number.isInteger(port) && port >= 1 && port <= 65535 ? port : undefined
}
