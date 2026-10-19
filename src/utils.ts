/** The value limited to the range min to max */
export const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max)

/** True if the value is one of the values of a string enum */
export function isEnumValue<TEnum extends Record<string, string>>(
	enumObject: TEnum,
	value: unknown,
): value is TEnum[keyof TEnum] {
	return typeof value === 'string' && Object.values<string>(enumObject).includes(value)
}

/**
 * Marks a branch the type system believes is unreachable, and supplies the value to use if it
 * is reached anyway. Leaving a union member unhandled above becomes a compile error here.
 *
 * It falls back rather than throwing: option values are restored from a saved configuration, so
 * one that this version no longer offers is still possible at runtime.
 */
export function unhandledOption<TFallback>(_value: never, fallback: TFallback): TFallback {
	return fallback
}

/** The message of anything thrown, which need not be an Error */
export function errorMessage(err: unknown): string {
	return err instanceof Error ? err.message : String(err)
}
