import { describe, expect, it } from 'vitest'
import { FeedbackId } from '../feedbacks.js'
import { CrosspointControlBusSelection, CrosspointControlSourceSelection } from '../enums.js'
import {
	checkFeedback,
	fakeInstance,
	feedbackDefinitions,
	feedbackValue,
	learnFeedback,
	unsubscribeFeedback,
} from './fixtures.js'

const { PGM, AUX1 } = CrosspointControlBusSelection

describe('Bus Source feedback', () => {
	it('is true only for the source on the bus', () => {
		const fake = fakeInstance()
		fake.self.state.setBusSource(AUX1, CrosspointControlSourceSelection.IN5)
		const defs = feedbackDefinitions(fake)
		expect(checkFeedback(defs, FeedbackId.BusSource, { bus: '113', source: '05' })).toBe(true)
		expect(checkFeedback(defs, FeedbackId.BusSource, { bus: '113', source: '06' })).toBe(false)
		expect(checkFeedback(defs, FeedbackId.BusSource, { bus: '01', source: '05' })).toBe(false)
	})

	it.each([{ bus: '1' }, { bus: 113 }, { bus: undefined }])('is false for bus %o', (options) => {
		const fake = fakeInstance()
		fake.self.state.setBusSource(AUX1, CrosspointControlSourceSelection.IN5)
		expect(checkFeedback(feedbackDefinitions(fake), FeedbackId.BusSource, { ...options, source: '05' })).toBe(false)
	})

	it('watches its bus, and moves to another when its bus is changed', () => {
		const fake = fakeInstance()
		const defs = feedbackDefinitions(fake)
		checkFeedback(defs, FeedbackId.BusSource, { bus: '01', source: '01' }, 'fb-1')
		checkFeedback(defs, FeedbackId.BusSource, { bus: '01', source: '02' }, 'fb-2')
		expect(fake.self.busSourceFeedbacks.feedbacksFor(PGM)).toEqual(['fb-1', 'fb-2'])
		checkFeedback(defs, FeedbackId.BusSource, { bus: '113', source: '01' }, 'fb-1')
		expect(fake.self.busSourceFeedbacks.feedbacksFor(PGM)).toEqual(['fb-2'])
		expect(fake.self.busSourceFeedbacks.feedbacksFor(AUX1)).toEqual(['fb-1'])
	})

	it('stops watching its bus once changed to one that is not a bus', () => {
		const fake = fakeInstance()
		const defs = feedbackDefinitions(fake)
		checkFeedback(defs, FeedbackId.BusSource, { bus: '01', source: '01' }, 'fb-1')
		checkFeedback(defs, FeedbackId.BusSource, { bus: '99', source: '01' }, 'fb-1')
		expect(fake.self.busSourceFeedbacks.feedbacksFor(PGM)).toEqual([])
	})

	it('stops watching its bus once removed', async () => {
		const fake = fakeInstance()
		const defs = feedbackDefinitions(fake)
		checkFeedback(defs, FeedbackId.BusSource, { bus: '01', source: '01' }, 'fb-1')
		await unsubscribeFeedback(defs, FeedbackId.BusSource, { bus: '01', source: '01' }, 'fb-1')
		expect(fake.self.busSourceFeedbacks.feedbacksFor(PGM)).toEqual([])
	})

	it('learns only the source', async () => {
		const fake = fakeInstance()
		fake.self.state.setBusSource(PGM, CrosspointControlSourceSelection.CLN)
		const defs = feedbackDefinitions(fake)
		await expect(learnFeedback(defs, FeedbackId.BusSource, { bus: '01', source: '01' })).resolves.toEqual({
			source: '172',
		})
		await expect(learnFeedback(defs, FeedbackId.BusSource, { bus: '02', source: '01' })).resolves.toBeUndefined()
	})

	it('takes the bus and source by expression, no longer as custom values', () => {
		const def = feedbackDefinitions(fakeInstance())[FeedbackId.BusSource]
		if (!def) throw new Error('Bus Source is not defined')
		expect(def.options.map((option) => option.id)).toEqual(['bus', 'source'])
		for (const option of def.options) expect(option).not.toHaveProperty('allowCustom')
	})
})

describe('Bus Source (Value) feedback', () => {
	it('gives the source on the bus, with its name as the source dropdowns show it', () => {
		const fake = fakeInstance()
		fake.self.state.setBusSource(PGM, CrosspointControlSourceSelection.IN5)
		fake.self.state.setBusSource(AUX1, CrosspointControlSourceSelection.CBAR)
		const defs = feedbackDefinitions(fake)
		expect(feedbackValue(defs, FeedbackId.BusSourceValue, { bus: '01' })).toEqual({ crosspoint: '05', name: 'INPUT 5' })
		expect(feedbackValue(defs, FeedbackId.BusSourceValue, { bus: '113' })).toEqual({
			crosspoint: '147',
			name: 'COLOR BARS',
		})
	})

	it.each([{ bus: '02' }, { bus: '99' }, { bus: 1 }, { bus: undefined }])(
		'is null for %o, a bus the switcher has not reported or one that is not a bus',
		(options) => {
			const fake = fakeInstance()
			fake.self.state.setBusSource(PGM, CrosspointControlSourceSelection.IN5)
			expect(feedbackValue(feedbackDefinitions(fake), FeedbackId.BusSourceValue, options)).toBeNull()
		},
	)

	it('watches its bus, moving with it, and stops once its bus is not one or it is removed', async () => {
		const fake = fakeInstance()
		const defs = feedbackDefinitions(fake)
		feedbackValue(defs, FeedbackId.BusSourceValue, { bus: '01' }, 'value-1')
		expect(fake.self.busSourceFeedbacks.feedbacksFor(PGM)).toEqual(['value-1'])
		feedbackValue(defs, FeedbackId.BusSourceValue, { bus: '113' }, 'value-1')
		expect(fake.self.busSourceFeedbacks.feedbacksFor(PGM)).toEqual([])
		expect(fake.self.busSourceFeedbacks.feedbacksFor(AUX1)).toEqual(['value-1'])
		feedbackValue(defs, FeedbackId.BusSourceValue, { bus: '99' }, 'value-1')
		expect(fake.self.busSourceFeedbacks.feedbacksFor(AUX1)).toEqual([])
		feedbackValue(defs, FeedbackId.BusSourceValue, { bus: '01' }, 'value-1')
		await unsubscribeFeedback(defs, FeedbackId.BusSourceValue, { bus: '01' }, 'value-1')
		expect(fake.self.busSourceFeedbacks.feedbacksFor(PGM)).toEqual([])
	})

	it('is watched alongside the Bus Source feedbacks on the same bus', () => {
		const fake = fakeInstance()
		const defs = feedbackDefinitions(fake)
		checkFeedback(defs, FeedbackId.BusSource, { bus: '01', source: '01' }, 'boolean-1')
		feedbackValue(defs, FeedbackId.BusSourceValue, { bus: '01' }, 'value-1')
		expect(fake.self.busSourceFeedbacks.feedbacksFor(PGM)).toEqual(['boolean-1', 'value-1'])
	})

	it('takes only the bus, by expression', () => {
		const def = feedbackDefinitions(fakeInstance())[FeedbackId.BusSourceValue]
		if (!def) throw new Error('Bus Source (Value) is not defined')
		expect(def).toMatchObject({ name: 'Bus Source (Value)', type: 'value' })
		expect(def.options).toMatchObject([{ id: 'bus', type: 'dropdown' }])
		expect(def.options[0]).not.toHaveProperty('disableAutoExpression')
	})
})
