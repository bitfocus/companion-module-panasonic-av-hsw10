import {
	FixupNumericOrVariablesValueToExpressions,
	type CompanionMigrationAction,
	type CompanionMigrationFeedback,
	type CompanionMigrationOptionValues,
	type CompanionStaticUpgradeProps,
	type CompanionStaticUpgradeResult,
	type CompanionStaticUpgradeScript,
	type CompanionUpgradeContext,
} from '@companion-module/base'
import type { ModuleConfig } from './config.js'
import { ActionId } from './actions.js'
import { FeedbackId } from './feedbacks.js'

type OptionValue = CompanionMigrationOptionValues[string]

/**
 * Options that were textinputs taking numbers and variables before the API 2.x migration. They are number fields since.
 * Frozen history for UpgradeScripts[0]: do not edit to track later changes, add a new script instead.
 */
export const numericActionOptionsApi2: Partial<Record<ActionId, string[]>> = {
	[ActionId.SetAutoTransitionTime]: ['time'],
	[ActionId.SetBusTransitionStatus]: ['time'],
	[ActionId.SetPinP]: ['xPos', 'yPos', 'size'],
}

/**
 * Options that were dropdowns allowing custom values before the API 2.x migration, so could hold a variable beside the
 * choice ids. They are dropdowns of the same string ids since, taking variables by expression. Frozen as
 * {@link numericActionOptionsApi2}.
 */
export const codeActionOptionsApi2: Partial<Record<ActionId, string[]>> = {
	[ActionId.SetBusSource]: ['bus', 'source'],
}

/** As {@link codeActionOptionsApi2}, for feedbacks */
export const codeFeedbackOptionsApi2: Partial<Record<FeedbackId, string[]>> = {
	[FeedbackId.BusSource]: ['bus', 'source'],
}

/**
 * For an option whose choice ids are codes such as '01'. A value holding a variable becomes an expression, by the same
 * rules as {@link FixupNumericOrVariablesValueToExpressions}. Anything else is left a string: that helper would make
 * '01' the number 1, and stored as a value, 1 is not '01'.
 */
export function fixupCodeOrVariablesValueToExpressions(value: OptionValue): OptionValue {
	if (value?.isExpression !== false || typeof value.value !== 'string' || !value.value.includes('$(')) return value
	return FixupNumericOrVariablesValueToExpressions(value)
}

/**
 * Converts the listed options in place. Returns whether anything changed — the helpers always hand back a fresh object,
 * so compare contents rather than identity, or every untouched action would be reported as updated.
 */
function fixupOptions(
	item: CompanionMigrationAction | CompanionMigrationFeedback,
	keys: string[] | undefined,
	fixup: (value: OptionValue) => OptionValue,
): boolean {
	if (!keys) return false
	let changed = false
	for (const key of keys) {
		const current = item.options[key]
		const fixed = fixup(current)
		if (fixed?.isExpression !== current?.isExpression || fixed?.value !== current?.value) {
			item.options[key] = fixed
			changed = true
		}
	}
	return changed
}

export const UpgradeScripts: CompanionStaticUpgradeScript<ModuleConfig>[] = [
	/*
	 * Place your upgrade scripts here
	 * Remember that once it has been added it cannot be removed!
	 */

	// 0: API 2.x — numeric textinputs became number fields, and the bus and source dropdowns lost allowCustom.
	// "3" becomes 3, "$(local:x)" becomes an expression, anything else with a variable is wrapped in parseVariables().
	function (
		_context: CompanionUpgradeContext<ModuleConfig>,
		props: CompanionStaticUpgradeProps<ModuleConfig, undefined>,
	): CompanionStaticUpgradeResult<ModuleConfig, undefined> {
		return {
			updatedConfig: null,
			updatedActions: props.actions.filter((action) => {
				const actionId = action.actionId as ActionId
				// Both run: || would skip the second once the first had changed something
				const numeric = fixupOptions(
					action,
					numericActionOptionsApi2[actionId],
					FixupNumericOrVariablesValueToExpressions,
				)
				const codes = fixupOptions(action, codeActionOptionsApi2[actionId], fixupCodeOrVariablesValueToExpressions)
				return numeric || codes
			}),
			updatedFeedbacks: props.feedbacks.filter((feedback) =>
				fixupOptions(
					feedback,
					codeFeedbackOptionsApi2[feedback.feedbackId as FeedbackId],
					fixupCodeOrVariablesValueToExpressions,
				),
			),
		}
	},
]
