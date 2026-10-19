import { describe, expect, it } from 'vitest'
import { DEFAULT_PORT, DEFAULT_UDP_PORT, GetConfigFields, validPort, type ModuleConfig } from '../config.js'

describe('config fields', () => {
	it('keep the ids saved in existing configs, one for each config key', () => {
		const ids = GetConfigFields()
			.filter((field) => field.type !== 'static-text')
			.map((field) => field.id)
		const keys: (keyof ModuleConfig)[] = ['host', 'port', 'portRecieve', 'verbose']
		expect(ids).toEqual(keys)
	})

	it('default the ports as before', () => {
		expect(GetConfigFields().find((field) => field.id === 'port')).toMatchObject({ type: 'number', default: 62000 })
		expect(GetConfigFields().find((field) => field.id === 'portRecieve')).toMatchObject({
			type: 'number',
			default: 65000,
		})
		expect([DEFAULT_PORT, DEFAULT_UDP_PORT]).toEqual([62000, 65000])
	})
})

describe('validPort', () => {
	it('accepts a whole number from 1 to 65535', () => {
		expect(validPort(1)).toBe(1)
		expect(validPort(62000)).toBe(62000)
		expect(validPort(65535)).toBe(65535)
	})

	it.each([0, 65536, 20.5, '62000', '', undefined, null, Number.NaN])('rejects %j', (port) => {
		expect(validPort(port)).toBeUndefined()
	})
})
