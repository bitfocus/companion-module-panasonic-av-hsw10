import { describe, expect, it } from 'vitest'
import { CrosspointControlSourceSelection } from '../enums.js'
import { SOURCE_CHOICES, SOURCE_NAMES } from '../options.js'

describe('source names', () => {
	it('name every source', () => {
		expect(Object.keys(SOURCE_NAMES).sort()).toEqual(Object.values(CrosspointControlSourceSelection).sort())
	})

	// SOURCE_CHOICES is built from SOURCE_NAMES, whose own key order would put '145' and the like before '01'
	it('keep the source dropdown in the order and with the labels it had', () => {
		expect(SOURCE_CHOICES.map(({ id }) => id)).toEqual([
			'01',
			'02',
			'03',
			'04',
			'05',
			'06',
			'07',
			'08',
			'09',
			'10',
			'145',
			'146',
			'147',
			'148',
			'149',
			'150',
			'151',
			'152',
			'165',
			'171',
			'172',
			'201',
			'203',
			'227',
			'228',
			'231',
			'232',
			'251',
		])
		expect(SOURCE_CHOICES.map(({ label }) => label)).toEqual([
			'INPUT 1',
			'INPUT 2',
			'INPUT 3',
			'INPUT 4',
			'INPUT 5',
			'INPUT 6',
			'INPUT 7',
			'INPUT 8',
			'INPUT 9',
			'ANALOG IN',
			'CBGD 1',
			'CBGD 2',
			'COLOR BARS',
			'BLACK',
			'STILL 1 - V',
			'STILL 1 - K',
			'STILL 2 - V',
			'STILL 2 - K',
			'MV',
			'KEY OUT',
			'CLEAN',
			'PGM',
			'PVW',
			'AUX 1',
			'AUX 2',
			'IP OUT 1',
			'IP OUT 2',
			'CLOCK',
		])
	})
})
