import type { AvHsw10 } from './main.js'
import { MsgSyntax } from './enums.js'
import { FeedbackId } from './feedbacks.js'

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
				if (data.length == 3) {
					self.state.setBusSource(data[1], data[2])
					self.addFeedbackToCheck(FeedbackId.BusSource)
				}
				break
			case 'ABSC':
				self.logger.console(`Message type: BusStatusResponse`)
				if (data.length == 3) {
					self.state.setBusSource(data[1], data[2])
					self.addFeedbackToCheck(FeedbackId.BusSource)
				}
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
	const str = String.fromCodePoint(...msg)
	self.logger.debug(`Parsing UDP message: ${str}`)
	parseTcpMsg(str, self)
}
