import type { AvHsw10 } from './main.js'
import { ErrorDetails, Messages, MsgSyntax } from './enums.js'
import { FeedbackId } from './feedbacks.js'

export interface DisplayMessageData {
	index: number
	rhTallyLampState: boolean
	textTallyState: boolean
	lhTallyLampState: boolean
	text: string
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function isMessage(test: any): test is Messages {
	return Object.values(Messages).indexOf(test) !== -1
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function isError(test: any): test is ErrorDetails {
	return Object.values(ErrorDetails).indexOf(test) !== -1
}

export const parseTcpMsg = (msg: string, self: AvHsw10): void => {
	msg = msg.replaceAll(MsgSyntax.Stx, '').replaceAll(MsgSyntax.Etx, '')
	const data = msg.split(MsgSyntax.Sep).map((element) => element.trim())
	const cmd = data[0]
	if (isMessage(cmd)) {
		try {
			switch (cmd) {
				case Messages.AutoTransitionTimeResponse:
					self.logger.console(`Message type: AutoTransitionTimeResponse`)
					break
				case Messages.BusCrosspointResponse:
					self.logger.console(`Message type: BusCrosspointResponse`)
					break
				case Messages.BusSettingResponse:
					self.logger.console(`Message type: BusSettingResponse`)
					if (data.length == 3) {
						if (self.state.setBusSource(data[1], data[2])) {
							self.addFeedbackToCheck(FeedbackId.BusSource)
						}
					}
					break
				case Messages.BusStatusResponse:
					self.logger.console(`Message type: BusStatusResponse`)
					if (data.length == 3) {
						if (self.state.setBusSource(data[1], data[2])) {
							self.addFeedbackToCheck(FeedbackId.BusSource)
						}
					}
					break
				case Messages.BusTransitionStatusResponse:
					self.logger.console(`Message type: BusTransitionStatusResponse`)
					break
				case Messages.KeySignalCouplingResponse:
					self.logger.console(`Message type: KeySignalCouplingResponse`)
					break
				case Messages.PinPStatusResponse:
					self.logger.console(`Message type: PinPStatusResponse`)
					break
				case Messages.SourceNameResponse:
					self.logger.console(`Message type: SourceNameResponse`)
					break
				case Messages.TransitionPatternResponse:
					self.logger.console(`Message type: TransitionPatternResponse`)
					break
				case Messages.Error:
					self.logger.console(`Message type: Error`)
					if (isError(data[1])) {
						switch (data[1]) {
							case ErrorDetails.OutOfRangeParameter:
								self.logger.warn('Error, Parameter out of range')
								break
							case ErrorDetails.SyntaxError:
								self.logger.warn('Syntax Error')
						}
					} else {
						self.logger.warn(`Error recieved with invalid error details. ${msg}`)
					}

					break
				default:
					self.logger.debug(`Message unexpectedly Control or Query type: ${data[0]}`)
			}
		} catch (e) {
			self.logger.warn(`Message parsing failed: ${e}`)
		}
	}
}

export const parseUdpMsg = (msg: Buffer, self: AvHsw10): void => {
	const str = String.fromCodePoint(...msg)
	self.logger.debug(`Parsing UDP message: ${str}`)
	parseTcpMsg(str, self)
}
