import { combineRgb, type CompanionFeedbackDefinitions } from '@companion-module/base'
import type { AvHsw10 } from './main.js'

export const colours = {
	black: combineRgb(0, 0, 0),
	white: combineRgb(255, 255, 255),
	red: combineRgb(255, 0, 0),
	green: combineRgb(0, 204, 0),
}

export function UpdateFeedbacks(self: AvHsw10): void {
	const feedbackDefs: CompanionFeedbackDefinitions = {}
	self.setFeedbackDefinitions(feedbackDefs)
}
