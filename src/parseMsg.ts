import type { AvHsw10 } from './main.js'
import { MsgSyntax } from './enums.js'

export interface DisplayMessageData {
	index: number
	rhTallyLampState: boolean
	textTallyState: boolean
	lhTallyLampState: boolean
	text: string
}

export const parseTcpMsg = (msg: string, self: AvHsw10): void => {
	msg = msg.replaceAll(MsgSyntax.Stx, '').replaceAll(MsgSyntax.Etx, '')
	const data = msg.split(MsgSyntax.Sep).map((element) => element.trim())
	try {
		switch (data[0]) {
			case 'ATIM':
				self.logger.console(`Message type: AutoTransitionTimeResponse`)
				break
			case 'ABST':
				self.logger.console(`Message type: BusCrosspointResponse`)
				break
			case 'ABUS':
				self.logger.console(`Message type: BusSettingResponse`)
				break
			case 'ABSC':
				self.logger.console(`Message type: BusStatusResponse`)
				break
			case 'ABTI':
				self.logger.console(`Message type: BusTransitionStatusResponse`)
				break
			case 'AKRS':
				self.logger.console(`Message type: KeySignalCouplingResponse`)
				break
			case 'APNP':
				self.logger.console(`Message type: PinPStatusResponse`)
				break
			case 'ASNM':
				self.logger.console(`Message type: SourceNameResponse`)
				break
			case 'APAT':
				self.logger.console(`Message type: TransitionPatternResponse`)
				break
			case 'EROR':
				self.logger.console(`Message type: Error`)
				switch (data[1]) {
					case '01':
						self.logger.warn('Error, Parameter out of range')
						break
					case '02':
						self.logger.warn('Syntax Error')
				}
				break
			default:
				self.logger.debug(`Message unexpectedly Control or Query type: ${data[0]}`)
		}
	} catch (e) {
		self.logger.warn(`Message parsing failed: ${e}`)
	}
}

export const parseUdpMsg = (msg: Buffer, self: AvHsw10): void => {
	self.logger.debug(`Parsing UDP message: ${msg}`)
	const PBC = msg.readUInt16LE(0)
	if (msg.length !== PBC + 2 || PBC > 2046) {
		self.logger.warn(`UDP message expected length. Expected ${PBC + 2}, Recieved: ${msg.length}`)
		return
	}
	const VER = msg.readUint8(2)
	const FLAGS = msg.readUint8(3)
	const SCREEN = msg.readUInt16BE(4)
	if (VER !== 0) {
		self.logger.warn(`Unexpected VER value in message, expected 0 recieved ${VER}`)
		return
	}
	if ((FLAGS & 2) !== 0) {
		self.logger.warn(`Message contains Screen Data ${SCREEN}`)
		return
	}
	const dsmg: DisplayMessageData[] = []
	let position = 6
	while (position < msg.length) {
		try {
			const newDisplayMsg: DisplayMessageData = {
				index: msg.readUInt16BE(position),
				rhTallyLampState: Boolean(msg.readUInt16BE(position + 2) & 3),
				textTallyState: Boolean(msg.readUInt16BE(position + 2) & 12),
				lhTallyLampState: Boolean(msg.readUInt16BE(position + 2) & 48),
				text: msg
					.subarray(position + 6, position + 18)
					.toString()
					.trim(),
			}
			dsmg.push(newDisplayMsg)
		} catch {
			self.logger.debug(`Failed to parse Display Message Data chunk`)
		}
		position += 18
	}
}
