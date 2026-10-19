import { describe, expect, it } from 'vitest'
import type {
	CompanionMigrationAction,
	CompanionMigrationFeedback,
	CompanionStaticUpgradeProps,
	CompanionUpgradeContext,
} from '@companion-module/base'
import {
	UpgradeScripts,
	codeActionOptionsApi2,
	codeFeedbackOptionsApi2,
	fixupCodeOrVariablesValueToExpressions,
	numericActionOptionsApi2,
} from '../upgrades.js'
import { ActionId } from '../actions.js'
import { FeedbackId } from '../feedbacks.js'
import type { ModuleConfig } from '../config.js'
import { actionDefinitions, fakeInstance, feedbackDefinitions } from './fixtures.js'

/**
 * Upgrade scripts are order-sensitive: a stored upgrade index records how far a configuration has been migrated,
 * so scripts may only ever be appended. Pin the index rather than taking the last entry, so appending a script
 * can't silently retarget this suite.
 */
const API2_SCRIPT_INDEX = 0
const EXPECTED_SCRIPT_COUNT = 1

// Options reach upgrade scripts already wrapped as ExpressionOrValue — Companion does that before running them
const v = (value: unknown) => ({ isExpression: false, value })

function action(actionId: string, options: Record<string, unknown>): CompanionMigrationAction {
	return {
		id: `action-${actionId}`,
		controlId: 'bank-1',
		actionId,
		options: options as CompanionMigrationAction['options'],
	}
}

function feedback(feedbackId: string, options: Record<string, unknown>): CompanionMigrationFeedback {
	return {
		id: `feedback-${feedbackId}`,
		controlId: 'bank-1',
		feedbackId,
		options: options as CompanionMigrationFeedback['options'],
	}
}

function run(
	actions: CompanionMigrationAction[],
	feedbacks: CompanionMigrationFeedback[] = [],
	savedConfig: ModuleConfig | null = null,
) {
	return UpgradeScripts[API2_SCRIPT_INDEX]({} as CompanionUpgradeContext<ModuleConfig>, {
		config: savedConfig,
		secrets: null,
		actions,
		feedbacks,
	} satisfies CompanionStaticUpgradeProps<ModuleConfig, undefined>)
}

describe('API 2.x upgrade script', () => {
	it('sits at the index this suite targets', () => {
		// Appending a script is fine — bump EXPECTED_SCRIPT_COUNT. Never insert, reorder or remove one.
		expect(UpgradeScripts).toHaveLength(EXPECTED_SCRIPT_COUNT)
	})

	it('makes the numbers typed into the old text inputs numbers', () => {
		const time = action(ActionId.SetAutoTransitionTime, { source: v('00'), time: v('30') })
		const pinp = action(ActionId.SetPinP, { target: v('1'), xPos: v('-12.5'), yPos: v(' 0 '), size: v('50') })
		const result = run([time, pinp])

		expect(result.updatedActions).toEqual([time, pinp])
		expect(time.options).toEqual({ source: v('00'), time: v(30) })
		expect(pinp.options).toEqual({ target: v('1'), xPos: v(-12.5), yPos: v(0), size: v(50) })
	})

	it('turns a variable in a number into an expression', () => {
		const existing = action(ActionId.SetBusTransitionStatus, { bus: v('01'), enable: v('01'), time: v('$(local:t)') })
		run([existing])

		expect(existing.options.time).toEqual({ isExpression: true, value: '$(local:t)' })
	})

	it('turns a variable in a bus or source into an expression, keeping the codes as they are', () => {
		const existing = action(ActionId.SetBusSource, { bus: v('$(internal:bus)'), source: v('0$(local:n)') })
		const codes = action(ActionId.SetBusSource, { bus: v('01'), source: v('148') })
		const result = run([existing, codes])

		expect(result.updatedActions).toEqual([existing])
		expect(existing.options).toEqual({
			bus: { isExpression: true, value: '$(internal:bus)' },
			source: { isExpression: true, value: 'parseVariables("0$(local:n)")' },
		})
		// FixupNumericOrVariablesValueToExpressions would have made these 1 and 148
		expect(codes.options).toEqual({ bus: v('01'), source: v('148') })
	})

	it('converts the bus source feedback the same way', () => {
		const existing = feedback(FeedbackId.BusSource, { bus: v('$(internal:b)'), source: v('05') })
		const untouched = feedback(FeedbackId.BusSource, { bus: v('113'), source: v('05') })
		const result = run([], [existing, untouched])

		expect(result.updatedFeedbacks).toEqual([existing])
		expect(existing.options).toEqual({ bus: { isExpression: true, value: '$(internal:b)' }, source: v('05') })
	})

	it('does not report actions it had nothing to convert', () => {
		const numbers = action(ActionId.SetPinP, { target: v('1'), xPos: v(0), yPos: v(0), size: v(50) })
		const other = action(ActionId.SetCutTransition, { source: v('00') })
		const alreadyExpression = action(ActionId.SetAutoTransitionTime, { time: { isExpression: true, value: '1 + 1' } })
		const missingOption = action(ActionId.SetAutoTransitionTime, {})
		const result = run([numbers, other, alreadyExpression, missingOption])

		expect(result.updatedActions).toEqual([])
		expect(alreadyExpression.options.time).toEqual({ isExpression: true, value: '1 + 1' })
	})

	it('leaves the config alone', () => {
		const config: ModuleConfig = { host: '10.0.0.1', port: 62000, portRecieve: 65000, verbose: false }
		expect(run([], [], config).updatedConfig).toBeNull()
	})
})

describe('fixupCodeOrVariablesValueToExpressions', () => {
	it.each([[v('01')], [v('')], [v(1)], [{ isExpression: true, value: '$(a:b)' }], [undefined]])(
		'leaves %j',
		(value) => {
			expect(fixupCodeOrVariablesValueToExpressions(value as never)).toBe(value)
		},
	)
})

type DefinitionLike =
	| { options: { id: string; type: string; choices?: readonly { id: unknown }[]; allowCustom?: boolean }[] }
	| false
	| undefined

describe('upgrade maps match the current definitions', () => {
	const actionDefs: Record<string, DefinitionLike> = actionDefinitions(fakeInstance())
	const feedbackDefs: Record<string, DefinitionLike> = feedbackDefinitions(fakeInstance())

	const optionIds = (
		def: DefinitionLike,
		test: (option: Exclude<DefinitionLike, false | undefined>['options'][number]) => boolean,
	) => (def ? def.options.filter(test).map((o) => o.id) : [])
	// The script stores numbers for these, so each must still be a number field
	const numberOptionIds = (def: DefinitionLike) => optionIds(def, (o) => o.type === 'number')
	// And leaves these strings, so each must still be a dropdown of string codes
	const codeOptionIds = (def: DefinitionLike) =>
		optionIds(def, (o) => o.type === 'dropdown' && !!o.choices?.every((c) => typeof c.id === 'string'))

	it('defines every action and feedback id in the enums', () => {
		expect(Object.keys(actionDefs).sort()).toEqual(Object.values(ActionId).sort())
		expect(Object.keys(feedbackDefs).sort()).toEqual(Object.values(FeedbackId).sort())
	})

	it('keeps the ids saved on buttons', () => {
		expect(Object.values(ActionId).sort()).toEqual([
			'SetAutoTransitionTime',
			'SetAuxTransition',
			'SetBusSource',
			'SetBusTransitionStatus',
			'SetCutTransition',
			'SetKeySignalCoupling',
			'SetPinP',
			'SetSourceName',
			'SetSourceNameDisplay',
			'SetTransitionPattern',
		])
		expect(Object.values(FeedbackId)).toEqual(['BusSource', 'BusSourceValue'])
	})

	it.each(Object.entries(numericActionOptionsApi2))('action %s: converted options are number fields', (id, keys) => {
		expect(numberOptionIds(actionDefs[id])).toEqual(expect.arrayContaining(keys))
	})

	it.each(Object.entries(codeActionOptionsApi2))('action %s: converted options are code dropdowns', (id, keys) => {
		expect(codeOptionIds(actionDefs[id])).toEqual(expect.arrayContaining(keys))
	})

	it.each(Object.entries(codeFeedbackOptionsApi2))('feedback %s: converted options are code dropdowns', (id, keys) => {
		expect(codeOptionIds(feedbackDefs[id])).toEqual(expect.arrayContaining(keys))
	})

	it('allows custom values nowhere, as expressions replace them', () => {
		for (const def of [...Object.values(actionDefs), ...Object.values(feedbackDefs)]) {
			for (const option of def ? def.options : []) expect(option.allowCustom).toBeUndefined()
		}
	})
})
