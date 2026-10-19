import { describe, expect, it } from 'vitest'
import { FrameReader, MAX_MESSAGE_LENGTH, messagesInDatagram, parseMessage } from '../parseMsg.js'
import { Messages } from '../enums.js'

const bytes = (text: string) => Buffer.from(text, 'latin1')

describe('FrameReader', () => {
	it('gives each message between STX and ETX', () => {
		const reader = new FrameReader()
		expect(reader.push(bytes('\x02ABSC:01:05\x03\x02ABSC:02:06\x03'))).toEqual(['ABSC:01:05', 'ABSC:02:06'])
	})

	it('holds a message split across chunks until its ETX arrives', () => {
		const reader = new FrameReader()
		expect(reader.push(bytes('\x02ABS'))).toEqual([])
		expect(reader.push(bytes('C:01'))).toEqual([])
		expect(reader.push(bytes(':05\x03\x02AB'))).toEqual(['ABSC:01:05'])
		expect(reader.push(bytes('US:02:01\x03'))).toEqual(['ABUS:02:01'])
	})

	it('drops bytes outside a message, and a message whose STX was lost', () => {
		const reader = new FrameReader()
		expect(reader.push(bytes('noise\x03\x02ABSC:01:05\x03junk'))).toEqual(['ABSC:01:05'])
		// Before, the text from the STX after the ETX was taken, giving an empty message
		expect(reader.push(bytes('SC:01:05\x03\x02ABSC:02:06\x03'))).toEqual(['ABSC:02:06'])
		expect(reader.push(bytes('lost start\x03'))).toEqual([])
	})

	it('starts again from the latest STX', () => {
		const reader = new FrameReader()
		expect(reader.push(bytes('\x02ABSC:0\x02ABSC:01:05\x03'))).toEqual(['ABSC:01:05'])
	})

	it('discards a message that grows too long without an ETX', () => {
		const reader = new FrameReader()
		reader.push(bytes(`\x02${'x'.repeat(MAX_MESSAGE_LENGTH)}`))
		expect(reader.push(bytes(':01:05\x03'))).toEqual([])
	})

	it('forgets a partial message once reset', () => {
		const reader = new FrameReader()
		reader.push(bytes('\x02ABSC:01'))
		reader.reset()
		expect(reader.push(bytes(':05\x03'))).toEqual([])
	})
})

describe('messagesInDatagram', () => {
	// Before, the STX and ETX of every message were stripped and the rest parsed as one message
	it('gives every message in a datagram', () => {
		expect(messagesInDatagram(bytes('\x02ABSC:01:05\x03\x02ABSC:02:06\x03'))).toEqual(['ABSC:01:05', 'ABSC:02:06'])
	})
})

describe('parseMessage', () => {
	it.each([
		['ABSC:01:05', Messages.BusStatusResponse, '01', '05'],
		['ABUS:113:148', Messages.BusSettingResponse, '113', '148'],
		[' ABSC : 02 : 251 ', Messages.BusStatusResponse, '02', '251'],
	])('reads %j as a bus source', (text, command, bus, source) => {
		expect(parseMessage(text)).toEqual({ type: 'busSource', command, bus, source })
	})

	it.each(['ABSC:01', 'ABSC:01:05:00', 'ABSC:99:05', 'ABSC:01:99', 'ABSC:1:5', 'XXXX:01:05', ''])(
		'takes %j as invalid',
		(text) => {
			expect(parseMessage(text)).toEqual({ type: 'invalid', text })
		},
	)

	it('reads an error and its detail', () => {
		expect(parseMessage('EROR:01')).toEqual({ type: 'error', detail: '01', text: 'EROR:01' })
		expect(parseMessage('EROR:02')).toMatchObject({ type: 'error', detail: '02' })
		expect(parseMessage('EROR:07')).toMatchObject({ type: 'error', detail: undefined })
	})

	it('ignores the other replies', () => {
		expect(parseMessage('ATIM:00:30')).toEqual({
			type: 'ignored',
			command: Messages.AutoTransitionTimeResponse,
			text: 'ATIM:00:30',
		})
	})
})
