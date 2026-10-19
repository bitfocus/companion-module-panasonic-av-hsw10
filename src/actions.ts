import type { CompanionActionDefinitions } from '@companion-module/base'
import type AvHsw10 from './main.js'
import { actionOptions, TRANSITION_TIME_MAX } from './options.js'
import {
	BusTransitionResponseEnable,
	BusType,
	CrosspointControlBusSelection,
	CrosspointControlSourceSelection,
	KeySignalCouplingStatus,
	Messages,
	PinPBorderColor,
	PinPBorderWidth,
	PinPStatusQueryTarget,
	SettingForAuxTransitionEffect,
	SettingForAuxTransitionOperationSetting,
	SettingForAuxTransitionSource,
	SourceNameClassification,
	SourceNameObject,
	TransitionPatternQueryType,
	TransitionPatternResponsePattern,
} from './enums.js'
import { clamp, isEnumValue } from './utils.js'
import { isBusType } from './switcher.js'

/**
 * Action ids. The values are the ids saved against every button using the action, so they must never change — they
 * predate this enum, which is why they are PascalCase and why SetAutoTransition is saved as SetAuxTransition.
 */
export enum ActionId {
	SetBusSource = 'SetBusSource',
	SetSourceNameDisplay = 'SetSourceNameDisplay',
	SetSourceName = 'SetSourceName',
	SetKeySignalCoupling = 'SetKeySignalCoupling',
	SetAutoTransition = 'SetAuxTransition',
	SetCutTransition = 'SetCutTransition',
	SetAutoTransitionTime = 'SetAutoTransitionTime',
	SetBusTransitionStatus = 'SetBusTransitionStatus',
	SetTransitionPattern = 'SetTransitionPattern',
	SetPinP = 'SetPinP',
}

/** The option keys are saved against every button too, misspelt `classisfication` included */
export type ActionSchema = {
	[ActionId.SetBusSource]: {
		options: { bus: CrosspointControlBusSelection; source: CrosspointControlSourceSelection }
	}
	[ActionId.SetSourceNameDisplay]: { options: { classisfication: SourceNameClassification } }
	[ActionId.SetSourceName]: { options: { source: SourceNameObject; name: string } }
	[ActionId.SetKeySignalCoupling]: { options: { status: KeySignalCouplingStatus } }
	[ActionId.SetAutoTransition]: {
		options: {
			source: SettingForAuxTransitionSource
			effect: SettingForAuxTransitionEffect
			operation: SettingForAuxTransitionOperationSetting
		}
	}
	[ActionId.SetCutTransition]: { options: { source: SettingForAuxTransitionSource } }
	[ActionId.SetAutoTransitionTime]: { options: { source: SettingForAuxTransitionSource; time: number } }
	[ActionId.SetBusTransitionStatus]: {
		options: { bus: BusType; enable: BusTransitionResponseEnable; time: number }
	}
	[ActionId.SetTransitionPattern]: {
		options: { type: TransitionPatternQueryType; pattern: TransitionPatternResponsePattern }
	}
	[ActionId.SetPinP]: {
		options: {
			target: PinPStatusQueryTarget
			xPos: number
			yPos: number
			size: number
			width: PinPBorderWidth
			colour: PinPBorderColor
		}
	}
}

/** The longest source name the switcher takes */
export const SOURCE_NAME_MAX_LENGTH = 12

/**
 * An option's value, checked against its choices. In expression mode Companion skips the action when the result is not
 * one of them, but a value is passed on unchecked, and one saved by an older version may no longer be offered.
 */
function choice<TEnum extends Record<string, string>>(
	enumObject: TEnum,
	value: unknown,
	label: string,
): TEnum[keyof TEnum] {
	if (!isEnumValue(enumObject, value)) throw new Error(`${label} ${String(value)} is not valid`)
	return value
}

/** An option's value, checked to be a number. As {@link choice}, a value is not checked by Companion */
function finite(value: unknown, label: string): number {
	if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`${label} ${String(value)} is not a number`)
	return value
}

/** A transition time as the switcher takes it: whole frames, 0 to 999 */
export function transitionTime(value: unknown): string {
	return Math.round(clamp(finite(value, 'Transition time'), 0, TRANSITION_TIME_MAX)).toString()
}

/**
 * A PinP position as the switcher takes it: hundredths of a percent, six digits, signed if negative.
 *
 * Rounded rather than floored: a value with two decimals is often a hair under in floating point, so 0.29 × 100 is
 * 28.999999999999996.
 */
export function pinpPosition(value: unknown, label: string): string {
	const position = clamp(finite(value, label), -100, 100)
	const hundredths = Math.round(Math.abs(position) * 100)
	return (position < 0 && hundredths !== 0 ? '-' : '') + hundredths.toString().padStart(6, '0')
}

/** A PinP size as the switcher takes it: hundredths of a percent, five digits */
export function pinpSize(value: unknown): string {
	return Math.round(clamp(finite(value, 'Size'), 0, 100) * 100)
		.toString()
		.padStart(5, '0')
}

export function UpdateActions(self: AvHsw10): void {
	const actionDefs: CompanionActionDefinitions<ActionSchema> = {
		[ActionId.SetBusSource]: {
			name: 'Bus Source',
			options: actionOptions.setBusSource(),
			callback: async ({ options }, context) => {
				const bus = choice(CrosspointControlBusSelection, options.bus, 'Bus')
				const source = choice(CrosspointControlSourceSelection, options.source, 'Source')
				await self.sendMessage(Messages.BusSettingControl, [bus, source], context.signal)
			},
			learn: ({ options }) => {
				if (!isBusType(options.bus)) return undefined
				const source = self.state.getBusSource(options.bus)
				return source === undefined ? undefined : { source }
			},
		},
		[ActionId.SetSourceNameDisplay]: {
			name: 'Source Name Display',
			options: actionOptions.setSourceNameDisplay(),
			callback: async ({ options }, context) => {
				const classification = choice(SourceNameClassification, options.classisfication, 'Classification')
				await self.sendMessage(Messages.SourceNameDisplay, ['0', classification], context.signal)
			},
		},
		[ActionId.SetSourceName]: {
			name: 'Source Name',
			options: actionOptions.setSourceName(),
			callback: async ({ options }, context) => {
				const source = choice(SourceNameObject, options.source, 'Source')
				// Companion has parsed any variables in the name already
				const name = String(options.name ?? '')
					.trim()
					.substring(0, SOURCE_NAME_MAX_LENGTH)
				await self.sendMessage(Messages.SourceNameSet, ['00', source, name], context.signal)
			},
		},
		[ActionId.SetKeySignalCoupling]: {
			name: 'Key Signal Coupling',
			options: actionOptions.setKeySignalCoupling(),
			callback: async ({ options }, context) => {
				const status = choice(KeySignalCouplingStatus, options.status, 'Status')
				await self.sendMessage(Messages.KeySignalCouplingSet, [status], context.signal)
			},
		},
		[ActionId.SetAutoTransition]: {
			name: 'Auto Transition',
			options: actionOptions.setAuxTransition(),
			callback: async ({ options }, context) => {
				const source = choice(SettingForAuxTransitionSource, options.source, 'Source')
				const effect = choice(SettingForAuxTransitionEffect, options.effect, 'Effect')
				const operation = choice(SettingForAuxTransitionOperationSetting, options.operation, 'Operation setting')
				await self.sendMessage(Messages.AutoTransitionSet, [source, effect, operation], context.signal)
			},
		},
		[ActionId.SetCutTransition]: {
			name: 'Cut Transition',
			options: actionOptions.setCutTransition(),
			callback: async ({ options }, context) => {
				const source = choice(SettingForAuxTransitionSource, options.source, 'Source')
				await self.sendMessage(Messages.CutTransitionSet, [source], context.signal)
			},
		},
		[ActionId.SetAutoTransitionTime]: {
			name: 'Auto Transition Time',
			options: actionOptions.setAutoTransitionTime(),
			callback: async ({ options }, context) => {
				const source = choice(SettingForAuxTransitionSource, options.source, 'Source')
				await self.sendMessage(Messages.AutoTransitionTimeSet, [source, transitionTime(options.time)], context.signal)
			},
		},
		[ActionId.SetBusTransitionStatus]: {
			name: 'Bus Transition Status',
			options: actionOptions.setBusTransitionStatus(),
			callback: async ({ options }, context) => {
				const bus = choice(BusType, options.bus, 'Bus')
				const enable = choice(BusTransitionResponseEnable, options.enable, 'Enable')
				await self.sendMessage(
					Messages.BusTransitionStatusSet,
					[bus, enable, transitionTime(options.time)],
					context.signal,
				)
			},
		},
		[ActionId.SetTransitionPattern]: {
			name: 'Transition Pattern',
			options: actionOptions.setTransitionPattern(),
			callback: async ({ options }, context) => {
				const type = choice(TransitionPatternQueryType, options.type, 'Type')
				const pattern = choice(TransitionPatternResponsePattern, options.pattern, 'Pattern')
				await self.sendMessage(Messages.TransitionPatternControl, [type, pattern], context.signal)
			},
		},
		[ActionId.SetPinP]: {
			name: 'Picture In Picture',
			options: actionOptions.setPinP(),
			callback: async ({ options }, context) => {
				const target = choice(PinPStatusQueryTarget, options.target, 'Target')
				const xPos = pinpPosition(options.xPos, 'X position')
				const yPos = pinpPosition(options.yPos, 'Y position')
				const size = pinpSize(options.size)
				// Unchanged unless set, as before these options had defaults
				const width = choice(PinPBorderWidth, options.width ?? PinPBorderWidth.NoneOfTheAbove, 'Border width')
				const colour = choice(PinPBorderColor, options.colour ?? PinPBorderColor.NoneOfTheAbove, 'Border colour')
				self.logger.console(
					`Set PinP Action. Target: ${target}, xPos: ${xPos}, yPos: ${yPos}, size: ${size}, width: ${width}, colour: ${colour}`,
				)
				await self.sendMessage(Messages.PinPSet, [target, xPos, yPos, size, width, colour], context.signal)
			},
		},
	}
	self.setActionDefinitions(actionDefs)
}
