import { CrosspointControlBusSelection, CrosspointControlSourceSelection } from './enums.js'

function isBusType(test: any): test is CrosspointControlBusSelection {
	return Object.values(CrosspointControlBusSelection).indexOf(test) !== -1
}

function isSourceType(test: any): test is CrosspointControlSourceSelection {
	return Object.values(CrosspointControlSourceSelection).indexOf(test) !== -1
}

export class SwitcherState {
	#BusSource: Map<CrosspointControlBusSelection, CrosspointControlSourceSelection> = new Map<
		CrosspointControlBusSelection,
		CrosspointControlSourceSelection
	>()

	constructor() {}

	public setBusSource(bus: string, source: string): void {
		if (isBusType(bus) && isSourceType(source)) {
			this.#BusSource.set(bus, source)
		}
	}

	public getBusSource(bus: string): string | undefined {
		if (isBusType(bus)) {
			return this.#BusSource.get(bus)
		}
		return undefined
	}

	public resetBusSources(): void {
		this.#BusSource.clear()
	}
}
