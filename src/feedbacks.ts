import { combineRgb, type CompanionFeedbackDefinitions } from '@companion-module/base'
import type AvHsw10 from './main.js'
import type { CrosspointControlBusSelection, CrosspointControlSourceSelection } from './enums.js'
import { feedbackOptions, SOURCE_NAMES } from './options.js'
import { isBusType } from './switcher.js'

export const colours = {
	black: combineRgb(0, 0, 0),
	white: combineRgb(255, 255, 255),
	red: combineRgb(255, 0, 0),
	green: combineRgb(0, 204, 0),
}

/**
 * Feedback ids. The values are the ids saved against every button using the feedback, so they must never change.
 * BusSource predates this enum and is PascalCase for that reason, and later ids match it.
 */
export enum FeedbackId {
	BusSource = 'BusSource',
	BusSourceValue = 'BusSourceValue',
}

/** The source on a bus, as the Bus Source (Value) feedback gives it */
export type BusSourceValue = {
	/** The switcher's code for the source, such as '05' */
	crosspoint: CrosspointControlSourceSelection
	/** As the source dropdowns name it, such as 'INPUT 5' */
	name: string
}

export type FeedbackSchema = {
	[FeedbackId.BusSource]: {
		type: 'boolean'
		options: { bus: CrosspointControlBusSelection; source: CrosspointControlSourceSelection }
	}
	[FeedbackId.BusSourceValue]: {
		type: 'value'
		options: { bus: CrosspointControlBusSelection }
		/** null until the switcher reports the bus */
		result: BusSourceValue | null
	}
}

/**
 * The source on a feedback's bus, registering the feedback to be rechecked when the switcher reports that bus. A
 * feedback edited to a bus that isn't one must still stop watching the bus it had.
 * @param id the feedback instance's id
 */
function watchBusSource(self: AvHsw10, id: string, bus: unknown): CrosspointControlSourceSelection | undefined {
	if (!isBusType(bus)) {
		self.busSourceFeedbacks.unsubscribe(id)
		return undefined
	}
	self.busSourceFeedbacks.subscribe(id, bus)
	return self.state.getBusSource(bus)
}

export function UpdateFeedbacks(self: AvHsw10): void {
	const feedbackDefs: CompanionFeedbackDefinitions<FeedbackSchema> = {
		[FeedbackId.BusSource]: {
			name: 'Bus Source',
			type: 'boolean',
			defaultStyle: {
				color: colours.black,
				bgcolor: colours.red,
			},
			options: feedbackOptions.setBusSource(),
			callback: ({ id, options }) => {
				const source = watchBusSource(self, id, options.bus)
				return source !== undefined && source === options.source
			},
			unsubscribe: ({ id }) => self.busSourceFeedbacks.unsubscribe(id),
			learn: ({ options }) => {
				if (!isBusType(options.bus)) return undefined
				const source = self.state.getBusSource(options.bus)
				return source === undefined ? undefined : { source }
			},
		},
		[FeedbackId.BusSourceValue]: {
			name: 'Bus Source (Value)',
			description: 'The source on the bus, as { crosspoint, name }. Null until the switcher reports the bus',
			type: 'value',
			options: feedbackOptions.busSourceValue(),
			callback: ({ id, options }) => {
				const source = watchBusSource(self, id, options.bus)
				return source === undefined ? null : { crosspoint: source, name: SOURCE_NAMES[source] }
			},
			unsubscribe: ({ id }) => self.busSourceFeedbacks.unsubscribe(id),
		},
	}
	self.setFeedbackDefinitions(feedbackDefs)
}
