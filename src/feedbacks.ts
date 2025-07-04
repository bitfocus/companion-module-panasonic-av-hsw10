import { combineRgb, type CompanionFeedbackDefinition } from '@companion-module/base'
import type { AvHsw10 } from './main.js'
import { Messages } from './enums.js'
import { feedbackOptions } from './options.js'
import { isBusType } from './switcher.js'

export const colours = {
	black: combineRgb(0, 0, 0),
	white: combineRgb(255, 255, 255),
	red: combineRgb(255, 0, 0),
	green: combineRgb(0, 204, 0),
}

export enum FeedbackId {
	BusSource = 'BusSource',
}

export function UpdateFeedbacks(self: AvHsw10): void {
	const feedbackDefs: { [id in FeedbackId]: CompanionFeedbackDefinition | undefined } = {
		[FeedbackId.BusSource]: {
			name: 'Bus Source',
			type: 'boolean',
			defaultStyle: {
				color: colours.black,
				bgcolor: colours.red,
			},
			options: feedbackOptions.setBusSource(),
			callback: async (feedback, context) => {
				return (
					(await context.parseVariablesInString(feedback.options.source?.toString() ?? '')) ===
					self.state.getBusSource(await context.parseVariablesInString(feedback.options.bus?.toString() ?? ''))
				)
			},
			subscribe: async (feedback, context) => {
				const bus = (await context.parseVariablesInString(feedback.options.bus?.toString() ?? '')).trim()
				if (isBusType(bus)) await self.sendMessage(Messages.BusStatusQuery, bus)
			},
			learn: async (feedback, context) => {
				const bus = (await context.parseVariablesInString(feedback.options.bus?.toString() ?? '')).trim()
				const source = self.state.getBusSource(bus)
				if (source) {
					return {
						...feedback.options,
						source: source,
					}
				}
				return undefined
			},
		},
	}
	self.setFeedbackDefinitions(feedbackDefs)
}
