import {
	Regex,
	type CompanionInputFieldDropdown,
	type CompanionInputFieldNumber,
	type DropdownChoice,
	type SomeCompanionActionInputField,
	type SomeCompanionFeedbackInputField,
} from '@companion-module/base'
import {
	CrosspointControlBusSelection,
	CrosspointControlSourceSelection,
	SourceNameClassification,
	SourceNameObject,
	KeySignalCouplingStatus,
	SettingForAuxTransitionSource,
	SettingForAuxTransitionEffect,
	SettingForAuxTransitionOperationSetting,
	BusType,
	BusTransitionResponseEnable,
	TransitionPatternQueryType,
	TransitionPatternResponsePattern,
	PinPStatusQueryTarget,
	PinPBorderWidth,
	PinPBorderColor,
} from './enums.js'

export const BUS_CHOICES = [
	{ id: CrosspointControlBusSelection.PGM, label: 'PGM' },
	{ id: CrosspointControlBusSelection.PVW, label: 'PVW' },
	{ id: CrosspointControlBusSelection.AUX1, label: 'AUX 1' },
	{ id: CrosspointControlBusSelection.AUX2, label: 'AUX 2' },
	{ id: CrosspointControlBusSelection.KEY1_F, label: 'KEY 1 F' },
	{ id: CrosspointControlBusSelection.KEY1_S, label: 'KEY 1 S' },
	{ id: CrosspointControlBusSelection.KEY2_F, label: 'KEY 2 F' },
	{ id: CrosspointControlBusSelection.KEY2_S, label: 'KEY 2 S' },
	{ id: CrosspointControlBusSelection.MV_1, label: 'MV 1' },
	{ id: CrosspointControlBusSelection.MV_2, label: 'MV 2' },
	{ id: CrosspointControlBusSelection.MV_3, label: 'MV 3' },
	{ id: CrosspointControlBusSelection.MV_4, label: 'MV 4' },
	{ id: CrosspointControlBusSelection.MV_5, label: 'MV 5' },
	{ id: CrosspointControlBusSelection.MV_6, label: 'MV 6' },
	{ id: CrosspointControlBusSelection.MV_7, label: 'MV 7' },
	{ id: CrosspointControlBusSelection.MV_8, label: 'MV 8' },
	{ id: CrosspointControlBusSelection.MV_9, label: 'MV 9' },
	{ id: CrosspointControlBusSelection.MV_10, label: 'MV 10' },
	{ id: CrosspointControlBusSelection.MV_11, label: 'MV 11' },
	{ id: CrosspointControlBusSelection.MV_12, label: 'MV 12' },
	{ id: CrosspointControlBusSelection.MV_13, label: 'MV 13' },
	{ id: CrosspointControlBusSelection.MV_14, label: 'MV 14' },
	{ id: CrosspointControlBusSelection.MV_15, label: 'MV 15' },
	{ id: CrosspointControlBusSelection.MV_16, label: 'MV 16' },
] as const satisfies DropdownChoice<CrosspointControlBusSelection>[]

/** The name of every source, as the dropdowns and the Bus Source (Value) feedback give it */
export const SOURCE_NAMES = {
	[CrosspointControlSourceSelection.IN1]: 'INPUT 1',
	[CrosspointControlSourceSelection.IN2]: 'INPUT 2',
	[CrosspointControlSourceSelection.IN3]: 'INPUT 3',
	[CrosspointControlSourceSelection.IN4]: 'INPUT 4',
	[CrosspointControlSourceSelection.IN5]: 'INPUT 5',
	[CrosspointControlSourceSelection.IN6]: 'INPUT 6',
	[CrosspointControlSourceSelection.IN7]: 'INPUT 7',
	[CrosspointControlSourceSelection.IN8]: 'INPUT 8',
	[CrosspointControlSourceSelection.IN9]: 'INPUT 9',
	[CrosspointControlSourceSelection.AnalogIN]: 'ANALOG IN',
	[CrosspointControlSourceSelection.CBGD1]: 'CBGD 1',
	[CrosspointControlSourceSelection.CBGD2]: 'CBGD 2',
	[CrosspointControlSourceSelection.CBAR]: 'COLOR BARS',
	[CrosspointControlSourceSelection.BLACK]: 'BLACK',
	[CrosspointControlSourceSelection.STILL1_V]: 'STILL 1 - V',
	[CrosspointControlSourceSelection.STILL1_K]: 'STILL 1 - K',
	[CrosspointControlSourceSelection.STILL2_V]: 'STILL 2 - V',
	[CrosspointControlSourceSelection.STILL2_K]: 'STILL 2 - K',
	[CrosspointControlSourceSelection.MV]: 'MV',
	[CrosspointControlSourceSelection.KeyOUT]: 'KEY OUT',
	[CrosspointControlSourceSelection.CLN]: 'CLEAN',
	[CrosspointControlSourceSelection.PGM]: 'PGM',
	[CrosspointControlSourceSelection.PVW]: 'PVW',
	[CrosspointControlSourceSelection.AUX1]: 'AUX 1',
	[CrosspointControlSourceSelection.AUX2]: 'AUX 2',
	[CrosspointControlSourceSelection.IPOUT1]: 'IP OUT 1',
	[CrosspointControlSourceSelection.IPOUT2]: 'IP OUT 2',
	[CrosspointControlSourceSelection.CLOCK]: 'CLOCK',
} as const satisfies Record<CrosspointControlSourceSelection, string>

/**
 * In the order the enum declares the sources. The order can't come from SOURCE_NAMES: JavaScript lists keys that read
 * as whole numbers, such as '145', ahead of the rest, such as '01'
 */
export const SOURCE_CHOICES: DropdownChoice<CrosspointControlSourceSelection>[] = Object.values(
	CrosspointControlSourceSelection,
).map((id) => ({ id, label: SOURCE_NAMES[id] }))

export const SOURCE_NAME_CLASSIFICATION_CHOICES = [
	{ id: SourceNameClassification.DEFAULT, label: 'DEFAULT' },
	{ id: SourceNameClassification.USER, label: 'USER' },
] as const satisfies DropdownChoice<SourceNameClassification>[]

export const SOURCE_NAME_OBJECT_CHOICES = [
	{ id: SourceNameObject.IN1, label: 'IN 1' },
	{ id: SourceNameObject.IN2, label: 'IN 2' },
	{ id: SourceNameObject.IN3, label: 'IN 3' },
	{ id: SourceNameObject.IN4, label: 'IN 4' },
	{ id: SourceNameObject.IN5, label: 'IN 5' },
	{ id: SourceNameObject.IN6, label: 'IN 6' },
	{ id: SourceNameObject.IN7, label: 'IN 7' },
	{ id: SourceNameObject.IN8, label: 'IN 8' },
	{ id: SourceNameObject.IN9, label: 'IN 9' },
	{ id: SourceNameObject.AUX1, label: 'AUX 1' },
	{ id: SourceNameObject.AUX2, label: 'AUX 2' },
] as const satisfies DropdownChoice<SourceNameObject>[]

export const KEY_SIGNAL_COUPLING_CHOICES = [
	{ id: KeySignalCouplingStatus.FillToSource, label: 'FILL TO SOURCE' },
	{ id: KeySignalCouplingStatus.SourceToFill, label: 'SOURCE TO FILL' },
] as const satisfies DropdownChoice<KeySignalCouplingStatus>[]

export const TRANSITION_SOURCE_CHOICES = [
	{ id: SettingForAuxTransitionSource.BKGD, label: 'BACKGROUND' },
	{ id: SettingForAuxTransitionSource.FTB, label: 'FTB' },
	{ id: SettingForAuxTransitionSource.KEY1, label: 'KEY 1' },
	{ id: SettingForAuxTransitionSource.KEY2, label: 'KEY 2' },
] as const satisfies DropdownChoice<SettingForAuxTransitionSource>[]

export const TRANSITION_EFFECT_CHOICES = [
	{ id: SettingForAuxTransitionEffect.MIX, label: 'MIX' },
	{ id: SettingForAuxTransitionEffect.WIPE, label: 'WIPE' },
] as const satisfies DropdownChoice<SettingForAuxTransitionEffect>[]

export const TRANSITION_OPERATION_CHOICES = [
	{ id: SettingForAuxTransitionOperationSetting.TriggerOn, label: 'Trigger ON' },
	{ id: SettingForAuxTransitionOperationSetting.OnTake, label: 'ON Take' },
	{ id: SettingForAuxTransitionOperationSetting.OffTake, label: 'OFF Take' },
] as const satisfies DropdownChoice<SettingForAuxTransitionOperationSetting>[]

export const AUX_BUS_CHOICES = [
	{ id: BusType.AUX1, label: 'AUX 1' },
	{ id: BusType.AUX2, label: 'AUX 2' },
] as const satisfies DropdownChoice<BusType>[]

export const BUS_TRANSITION_ENABLE_CHOICES = [
	{ id: BusTransitionResponseEnable.Enable, label: 'Enable' },
	{ id: BusTransitionResponseEnable.Disable, label: 'Disable' },
] as const satisfies DropdownChoice<BusTransitionResponseEnable>[]

export const TRANSITION_PATTERN_TYPE_CHOICES = [
	{ id: TransitionPatternQueryType.BKGD, label: 'BACKGROUND' },
	{ id: TransitionPatternQueryType.KEY1, label: 'KEY 1' },
] as const satisfies DropdownChoice<TransitionPatternQueryType>[]

export const TRANSITION_PATTERN_CHOICES = [
	{ id: TransitionPatternResponsePattern.WIPE01, label: 'WIPE 1' },
	{ id: TransitionPatternResponsePattern.WIPE02, label: 'WIPE 2' },
	{ id: TransitionPatternResponsePattern.WIPE03, label: 'WIPE 3' },
	{ id: TransitionPatternResponsePattern.WIPE04, label: 'WIPE 4' },
	{ id: TransitionPatternResponsePattern.WIPE05, label: 'WIPE 5' },
	{ id: TransitionPatternResponsePattern.WIPE06, label: 'WIPE 6' },
	{ id: TransitionPatternResponsePattern.WIPE07, label: 'WIPE 7' },
	{ id: TransitionPatternResponsePattern.WIPE08, label: 'WIPE 8' },
	{ id: TransitionPatternResponsePattern.WIPE09, label: 'WIPE 9' },
	{ id: TransitionPatternResponsePattern.WIPE10, label: 'WIPE 10' },
	{ id: TransitionPatternResponsePattern.WIPE11, label: 'WIPE 11' },
	{ id: TransitionPatternResponsePattern.WIPE12, label: 'WIPE 12' },
	{ id: TransitionPatternResponsePattern.WIPE13, label: 'WIPE 13' },
	{ id: TransitionPatternResponsePattern.WIPE14, label: 'WIPE 14' },
	{ id: TransitionPatternResponsePattern.WIPE15, label: 'WIPE 15' },
	{ id: TransitionPatternResponsePattern.WIPE16, label: 'WIPE 16' },
] as const satisfies DropdownChoice<TransitionPatternResponsePattern>[]

export const PINP_TARGET_CHOICES = [
	{ id: PinPStatusQueryTarget.PinPKEY1, label: 'KEY 1' },
	{ id: PinPStatusQueryTarget.PinPKEY2, label: 'KEY 2' },
] as const satisfies DropdownChoice<PinPStatusQueryTarget>[]

export const PINP_BORDER_WIDTH_CHOICES = [
	{ id: PinPBorderWidth.None, label: 'None' },
	{ id: PinPBorderWidth.Small, label: 'Small' },
	{ id: PinPBorderWidth.Medium, label: 'Medium' },
	{ id: PinPBorderWidth.Large, label: 'Large' },
	{ id: PinPBorderWidth.NoneOfTheAbove, label: 'Unchanged' },
] as const satisfies DropdownChoice<PinPBorderWidth>[]

export const PINP_BORDER_COLOR_CHOICES = [
	{ id: PinPBorderColor.Black, label: 'Black' },
	{ id: PinPBorderColor.Gray1, label: 'Gray 1' },
	{ id: PinPBorderColor.Gray2, label: 'Gray 2' },
	{ id: PinPBorderColor.White, label: 'White' },
	{ id: PinPBorderColor.NoneOfTheAbove, label: 'Unchanged' },
] as const satisfies DropdownChoice<PinPBorderColor>[]

/** Transition time range, in frames */
export const TRANSITION_TIME_MAX = 999

/**
 * Before API 2.x these were dropdowns allowing custom values, which is how variables got in. Expression mode replaces
 * that, and UpgradeScripts[0] converts the variables saved. Companion compares an expression's result with the choice
 * ids loosely, so a number matches the code it reads as.
 */
function busOption(): CompanionInputFieldDropdown<'bus', CrosspointControlBusSelection> {
	return {
		type: 'dropdown',
		id: 'bus',
		label: 'Bus',
		choices: BUS_CHOICES,
		default: BUS_CHOICES[0].id,
		expressionDescription: `Should return a bus code, such as ${CrosspointControlBusSelection.PGM} for PGM or ${CrosspointControlBusSelection.AUX1} for AUX 1`,
	}
}

/** As {@link busOption} */
function sourceOption(): CompanionInputFieldDropdown<'source', CrosspointControlSourceSelection> {
	return {
		type: 'dropdown',
		id: 'source',
		label: 'Source',
		choices: SOURCE_CHOICES,
		default: SOURCE_CHOICES[0].id,
		expressionDescription: `Should return a source code, such as ${CrosspointControlSourceSelection.IN1} for INPUT 1 or ${CrosspointControlSourceSelection.BLACK} for BLACK`,
	}
}

/** @param readByIsVisible set where another field's isVisibleExpression reads this one, see {@link isOption} */
function transitionSourceOption(
	readByIsVisible = false,
): CompanionInputFieldDropdown<'source', SettingForAuxTransitionSource> {
	return {
		type: 'dropdown',
		id: 'source',
		label: 'Source',
		choices: TRANSITION_SOURCE_CHOICES,
		default: TRANSITION_SOURCE_CHOICES[0].id,
		...(readByIsVisible && { disableAutoExpression: true }),
	}
}

function transitionTimeOption(): CompanionInputFieldNumber<'time'> {
	return {
		type: 'number',
		id: 'time',
		label: 'Time (Frames)',
		default: 0,
		min: 0,
		max: TRANSITION_TIME_MAX,
		step: 1,
		asInteger: true,
		clampValues: true,
	}
}

/** A PinP position or size, as a percentage to two decimal places */
function pinpNumberOption<TKey extends string>(
	id: TKey,
	label: string,
	min: number,
	defaultValue: number,
): CompanionInputFieldNumber<TKey> {
	return {
		type: 'number',
		id,
		label,
		default: defaultValue,
		min,
		max: 100,
		step: 0.01,
		clampValues: true,
		tooltip: `Range ${min} to 100`,
	}
}

/**
 * The isVisibleExpression of a field can only read fields that cannot be expressions, so the fields these read have
 * disableAutoExpression set. None could hold a variable before API 2.x, so nothing saved is lost by it.
 */
const isOption = (id: string, value: string, is = true): string => `$(options:${id}) ${is ? '==' : '!='} '${value}'`

export const actionOptions = {
	setBusSource: (): SomeCompanionActionInputField<'bus' | 'source'>[] => [busOption(), sourceOption()],
	setSourceNameDisplay: (): SomeCompanionActionInputField<'classisfication'>[] => [
		{
			type: 'dropdown',
			id: 'classisfication',
			label: 'Classification',
			choices: SOURCE_NAME_CLASSIFICATION_CHOICES,
			default: SOURCE_NAME_CLASSIFICATION_CHOICES[0].id,
		},
	],
	setSourceName: (): SomeCompanionActionInputField<'source' | 'name'>[] => [
		{
			type: 'dropdown',
			id: 'source',
			label: 'Source',
			choices: SOURCE_NAME_OBJECT_CHOICES,
			default: SOURCE_NAME_OBJECT_CHOICES[0].id,
		},
		{
			type: 'textinput',
			id: 'name',
			label: 'Name',
			default: 'INPUT 1',
			useVariables: true,
			tooltip: 'Maximum 12 Characters',
			regex: Regex.SOMETHING,
		},
	],
	setKeySignalCoupling: (): SomeCompanionActionInputField<'status'>[] => [
		{
			type: 'dropdown',
			id: 'status',
			label: 'Status',
			choices: KEY_SIGNAL_COUPLING_CHOICES,
			default: KEY_SIGNAL_COUPLING_CHOICES[0].id,
			disableAutoExpression: true,
		},
		{
			type: 'static-text',
			id: 'info1',
			label: '',
			value: 'When a key fill signal is selected, the key source signal is also automatically switched',
			isVisibleExpression: isOption('status', KeySignalCouplingStatus.FillToSource),
		},
		{
			type: 'static-text',
			id: 'info2',
			label: '',
			value: 'When a key source signal is selected, the key fill signal is also automatically switched',
			isVisibleExpression: isOption('status', KeySignalCouplingStatus.SourceToFill),
		},
	],
	setAuxTransition: (): SomeCompanionActionInputField<'source' | 'effect' | 'operation'>[] => [
		transitionSourceOption(true),
		{
			type: 'dropdown',
			id: 'effect',
			label: 'Effect',
			choices: TRANSITION_EFFECT_CHOICES,
			default: TRANSITION_EFFECT_CHOICES[0].id,
			isVisibleExpression: isOption('source', SettingForAuxTransitionSource.BKGD),
		},
		{
			type: 'dropdown',
			id: 'operation',
			label: 'Operation Setting',
			choices: TRANSITION_OPERATION_CHOICES,
			default: TRANSITION_OPERATION_CHOICES[0].id,
			disableAutoExpression: true,
		},
		{
			type: 'static-text',
			id: 'info1',
			label: '',
			value: 'Excluding when BKGD is selected',
			isVisibleExpression: isOption('operation', SettingForAuxTransitionOperationSetting.TriggerOn, false),
		},
	],
	setCutTransition: (): SomeCompanionActionInputField<'source'>[] => [
		transitionSourceOption(),
		{
			type: 'static-text',
			id: 'info1',
			label: '',
			value: 'Setting for CUT Transition (trigger issued).',
		},
	],
	setAutoTransitionTime: (): SomeCompanionActionInputField<'source' | 'time'>[] => [
		transitionSourceOption(),
		transitionTimeOption(),
		{
			type: 'static-text',
			id: 'info1',
			label: '',
			value: `Transition time range 0 to ${TRANSITION_TIME_MAX} frames.`,
		},
	],
	setBusTransitionStatus: (): SomeCompanionActionInputField<'bus' | 'enable' | 'time'>[] => [
		{
			type: 'dropdown',
			id: 'bus',
			label: 'Bus',
			choices: AUX_BUS_CHOICES,
			default: AUX_BUS_CHOICES[1].id,
		},
		{
			type: 'dropdown',
			id: 'enable',
			label: 'Enable',
			choices: BUS_TRANSITION_ENABLE_CHOICES,
			default: BUS_TRANSITION_ENABLE_CHOICES[0].id,
		},
		transitionTimeOption(),
		{
			type: 'static-text',
			id: 'info1',
			label: '',
			value: `Transition time range 0 to ${TRANSITION_TIME_MAX} frames.`,
		},
	],
	setTransitionPattern: (): SomeCompanionActionInputField<'type' | 'pattern'>[] => [
		{
			type: 'dropdown',
			id: 'type',
			label: 'Type',
			choices: TRANSITION_PATTERN_TYPE_CHOICES,
			default: TRANSITION_PATTERN_TYPE_CHOICES[0].id,
		},
		{
			type: 'dropdown',
			id: 'pattern',
			label: 'Pattern',
			choices: TRANSITION_PATTERN_CHOICES,
			default: TRANSITION_PATTERN_CHOICES[0].id,
		},
	],
	setPinP: (): SomeCompanionActionInputField<'target' | 'xPos' | 'yPos' | 'size' | 'width' | 'colour'>[] => [
		{
			type: 'dropdown',
			id: 'target',
			label: 'Target',
			choices: PINP_TARGET_CHOICES,
			default: PINP_TARGET_CHOICES[0].id,
		},
		pinpNumberOption('xPos', 'Central X Position', -100, 0),
		pinpNumberOption('yPos', 'Central Y Position', -100, 0),
		pinpNumberOption('size', 'Size', 0, 50),
		{
			type: 'dropdown',
			id: 'width',
			label: 'Border Width',
			choices: PINP_BORDER_WIDTH_CHOICES,
			default: PINP_BORDER_WIDTH_CHOICES[4].id,
		},
		{
			type: 'dropdown',
			id: 'colour',
			label: 'Border Color',
			choices: PINP_BORDER_COLOR_CHOICES,
			default: PINP_BORDER_COLOR_CHOICES[4].id,
		},
	],
}

export const feedbackOptions = {
	setBusSource: (): SomeCompanionFeedbackInputField<'bus' | 'source'>[] => [busOption(), sourceOption()],
	busSourceValue: (): SomeCompanionFeedbackInputField<'bus'>[] => [busOption()],
}
