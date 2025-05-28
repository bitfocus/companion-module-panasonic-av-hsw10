import { Regex, type SomeCompanionConfigField } from '@companion-module/base'

export interface ModuleConfig {
	host: string
	port: number
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
			default: 62000,
		},
		{
			type: 'number',
			id: 'portRecieve',
			label: 'UDP Destination Port',
			width: 4,
			min: 1,
			max: 65535,
			default: 65000,
			tooltip:
				'Companion will bind to this port on 0.0.0.0. Each module instance must have a unique port. This must match the Destination Port in the device configuration',
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
