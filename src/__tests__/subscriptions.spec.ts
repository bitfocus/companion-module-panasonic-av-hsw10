import { describe, expect, it } from 'vitest'
import { FeedbackSubscriptions } from '../subscriptions.js'

describe('FeedbackSubscriptions', () => {
	it('gives the feedbacks reading an item, each once, and none for an item nothing reads', () => {
		const subscriptions = new FeedbackSubscriptions<string>()
		subscriptions.subscribe('a', '01')
		subscriptions.subscribe('b', '01')
		subscriptions.subscribe('a', '01')
		subscriptions.subscribe('c', '113')
		expect(subscriptions.feedbacksFor('01')).toEqual(['a', 'b'])
		expect(subscriptions.feedbacksFor('113')).toEqual(['c'])
		expect(subscriptions.feedbacksFor('02')).toEqual([])
	})

	// Companion runs the callback again with the new options, and calls no unsubscribe
	it('moves a feedback that subscribes to another item off the one it had', () => {
		const subscriptions = new FeedbackSubscriptions<string>()
		subscriptions.subscribe('a', '01')
		subscriptions.subscribe('b', '01')
		subscriptions.subscribe('a', '02')
		expect(subscriptions.feedbacksFor('01')).toEqual(['b'])
		expect(subscriptions.feedbacksFor('02')).toEqual(['a'])
	})

	it('forgets a feedback once unsubscribed, and ignores one it does not know', () => {
		const subscriptions = new FeedbackSubscriptions()
		subscriptions.subscribe('a', 3)
		subscriptions.unsubscribe('a')
		subscriptions.unsubscribe('b')
		expect(subscriptions.feedbacksFor(3)).toEqual([])
		subscriptions.subscribe('a', 3)
		expect(subscriptions.feedbacksFor(3)).toEqual(['a'])
	})
})
