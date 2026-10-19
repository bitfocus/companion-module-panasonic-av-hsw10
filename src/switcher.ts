import { CrosspointControlBusSelection, CrosspointControlSourceSelection } from './enums.js'
import { isEnumValue } from './utils.js'

export function isBusType(test: unknown): test is CrosspointControlBusSelection {
	return isEnumValue(CrosspointControlBusSelection, test)
}

export function isSourceType(test: unknown): test is CrosspointControlSourceSelection {
	return isEnumValue(CrosspointControlSourceSelection, test)
}

export class SwitcherState {
	/** The source on each bus, as the switcher last reported it. A bus it hasn't reported is absent */
	readonly #busSource = new Map<CrosspointControlBusSelection, CrosspointControlSourceSelection>()

	/** @returns true if the source differs from the one the bus had */
	public setBusSource(bus: CrosspointControlBusSelection, source: CrosspointControlSourceSelection): boolean {
		if (this.#busSource.get(bus) === source) return false
		this.#busSource.set(bus, source)
		return true
	}

	public getBusSource(bus: CrosspointControlBusSelection): CrosspointControlSourceSelection | undefined {
		return this.#busSource.get(bus)
	}

	public resetBusSources(): void {
		this.#busSource.clear()
	}
}
