import type { AvHsw10 } from './main.js'
import { MsgSyntax, Messages } from './enums.js'

export const parseTcpMsg = (msg: string, self: AvHsw10): void => {
	msg = msg.replaceAll(MsgSyntax.Stx, '').replaceAll(MsgSyntax.Etx, '')
	const data = msg.split(MsgSyntax.Sep)
	if (data[0] in Messages) {
		switch (data[0] as Messages) {
			case Messages.AutoTransitionTimeResponse:
				self.logger.console(`Message type: AutoTransitionTimeResponse`)
				break
			case Messages.BusCrosspointResponse:
				self.logger.console(`Message type: BusCrosspointResponse`)
				break
			case Messages.BusSettingResponse:
				self.logger.console(`Message type: BusSettingResponse`)
				break
			case Messages.BusStatusResponse:
				self.logger.console(`Message type: BusStatusResponse`)
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
				break
			default:
				self.logger.debug(`Message unexpectedly Control or Query type: ${data[0]}`)
		}
	} else {
		self.logger.warn(`Unrecognised message type: ${data[0]} from: ${msg}`)
	}
}
