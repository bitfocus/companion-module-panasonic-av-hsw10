import {
	CrosspointControlBusSelection,
	CrosspointControlSourceSelection,
	ErrorDetails,
	ETX,
	Messages,
	MsgSyntax,
	STX,
} from './enums.js'
import { isBusType, isSourceType } from './switcher.js'
import { isEnumValue } from './utils.js'

/**
 * Longest a message may grow without an ETX before it is discarded. The longest reply in the protocol is a source name
 * response, well under this
 */
export const MAX_MESSAGE_LENGTH = 256

export type ParsedMessage =
	/** An ABUS or ABSC: the source now on a bus */
	| {
			type: 'busSource'
			command: Messages.BusSettingResponse | Messages.BusStatusResponse
			bus: CrosspointControlBusSelection
			source: CrosspointControlSourceSelection
	  }
	/** An EROR. The detail is undefined if it is not one the protocol defines */
	| { type: 'error'; detail: ErrorDetails | undefined; text: string }
	/** A known message this module takes no state from */
	| { type: 'ignored'; command: Messages; text: string }
	/** Anything else, including an ABUS or ABSC naming an unknown bus or source */
	| { type: 'invalid'; text: string }

/**
 * Splits a byte stream into messages. Each message is the text between an STX and the next ETX, so bytes outside of
 * one are dropped, and a message split over several chunks is held until its ETX arrives.
 */
export class FrameReader {
	#pending = ''

	/** @returns the text of each message completed by the chunk, without its STX and ETX */
	push(chunk: Buffer): string[] {
		// latin1 maps every byte to one character, so a chunk can't end part way through one
		this.#pending += chunk.toString('latin1')
		const messages: string[] = []
		let end: number
		while ((end = this.#pending.indexOf(ETX)) !== -1) {
			const start = this.#pending.lastIndexOf(STX, end)
			if (start !== -1) messages.push(this.#pending.slice(start + 1, end))
			this.#pending = this.#pending.slice(end + 1)
		}
		const start = this.#pending.lastIndexOf(STX)
		this.#pending = start === -1 || this.#pending.length - start > MAX_MESSAGE_LENGTH ? '' : this.#pending.slice(start)
		return messages
	}

	reset(): void {
		this.#pending = ''
	}
}

/** The messages in a UDP datagram, which carries whole messages only */
export function messagesInDatagram(datagram: Buffer): string[] {
	return new FrameReader().push(datagram)
}

/** @param text a message without its STX and ETX */
export function parseMessage(text: string): ParsedMessage {
	const [command, ...args] = text.split(MsgSyntax.Sep).map((element) => element.trim())
	if (!isEnumValue(Messages, command)) return { type: 'invalid', text }
	switch (command) {
		case Messages.BusSettingResponse:
		case Messages.BusStatusResponse: {
			const [bus, source] = args
			if (args.length !== 2 || !isBusType(bus) || !isSourceType(source)) return { type: 'invalid', text }
			return { type: 'busSource', command, bus, source }
		}
		case Messages.Error:
			return { type: 'error', detail: isEnumValue(ErrorDetails, args[0]) ? args[0] : undefined, text }
		default:
			return { type: 'ignored', command, text }
	}
}
