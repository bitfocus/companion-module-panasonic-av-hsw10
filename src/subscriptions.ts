/**
 * The feedback instances in use, by the item each reads its state from: a bus source feedback by its bus. When the
 * switcher reports a change to one, only the feedbacks reading it are rechecked.
 *
 * A feedback registers from its callback, with the item its options name. Companion runs the callback again when the
 * options change, without calling unsubscribe, so registering also moves the feedback off the item it had before.
 */
export class FeedbackSubscriptions<TKey extends string | number = number> {
	/** The feedback instance ids reading each item */
	readonly #byKey = new Map<TKey, Set<string>>()
	/** The item each feedback instance reads */
	readonly #keyOf = new Map<string, TKey>()

	/**
	 * Registers a feedback instance against an item, moving it off any other
	 * @param id the feedback instance's `id`, not the `feedbackId` of its definition
	 */
	subscribe(id: string, key: TKey): void {
		if (this.#keyOf.get(id) === key) return
		this.unsubscribe(id)
		this.#keyOf.set(id, key)
		let ids = this.#byKey.get(key)
		if (ids === undefined) {
			ids = new Set()
			this.#byKey.set(key, ids)
		}
		ids.add(id)
	}

	/** For a feedback instance that has been removed or disabled */
	unsubscribe(id: string): void {
		const key = this.#keyOf.get(id)
		if (key === undefined) return
		this.#keyOf.delete(id)
		const ids = this.#byKey.get(key)
		ids?.delete(id)
		if (ids?.size === 0) this.#byKey.delete(key)
	}

	/** The ids of the feedback instances reading an item */
	feedbacksFor(key: TKey): string[] {
		return [...(this.#byKey.get(key) ?? [])]
	}
}
