export const rangeLimitedNumber = (value: number, min: number, max: number, int: boolean = false): number => {
	const newValue = value < min ? min : value > max ? max : value
	return int ? Math.floor(newValue) : newValue
}

export const isAnyNans = (...vals: number[]): boolean => {
	for (const value of vals) {
		if (Number.isNaN(value)) return true
	}
	return false
}
