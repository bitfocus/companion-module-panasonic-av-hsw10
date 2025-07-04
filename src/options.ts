import { SomeCompanionActionInputField, SomeCompanionFeedbackInputField } from '@companion-module/base'
import { Regex } from '@companion-module/base'
import {
	CrosspointControlBusSelection,
	CrosspointControlSourceSelection,
	SourceNameClassicifcation,
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

export const actionOptions = {
	setBusSource: (): SomeCompanionActionInputField[] => {
		return [
			{
				type: 'dropdown',
				id: 'bus',
				label: 'Bus',
				choices: [
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
				],
				default: CrosspointControlBusSelection.PGM,
				allowCustom: false,
			},
			{
				type: 'dropdown',
				id: 'source',
				label: 'Source',
				choices: [
					{ id: CrosspointControlSourceSelection.IN1, label: 'INPUT 1' },
					{ id: CrosspointControlSourceSelection.IN2, label: 'INPUT 2' },
					{ id: CrosspointControlSourceSelection.IN3, label: 'INPUT 3' },
					{ id: CrosspointControlSourceSelection.IN4, label: 'INPUT 4' },
					{ id: CrosspointControlSourceSelection.IN5, label: 'INPUT 5' },
					{ id: CrosspointControlSourceSelection.IN6, label: 'INPUT 6' },
					{ id: CrosspointControlSourceSelection.IN7, label: 'INPUT 7' },
					{ id: CrosspointControlSourceSelection.IN8, label: 'INPUT 8' },
					{ id: CrosspointControlSourceSelection.IN9, label: 'INPUT 9' },
					{ id: CrosspointControlSourceSelection.AnalogIN, label: 'ANALOG IN' },
					{ id: CrosspointControlSourceSelection.CBGD1, label: 'CBGD 1' },
					{ id: CrosspointControlSourceSelection.CBGD2, label: 'CBGD 2' },
					{ id: CrosspointControlSourceSelection.CBAR, label: 'COLOR BARS' },
					{ id: CrosspointControlSourceSelection.BLACK, label: 'BLACK' },
					{ id: CrosspointControlSourceSelection.STILL1_V, label: 'STILL 1 - V' },
					{ id: CrosspointControlSourceSelection.STILL1_K, label: 'STILL 1 - K' },
					{ id: CrosspointControlSourceSelection.STILL2_V, label: 'STILL 2 - V' },
					{ id: CrosspointControlSourceSelection.STILL2_K, label: 'STILL 2 - K' },
					{ id: CrosspointControlSourceSelection.MV, label: 'MV' },
					{ id: CrosspointControlSourceSelection.KeyOUT, label: 'KEY OUT' },
					{ id: CrosspointControlSourceSelection.CLN, label: 'CLEAN' },
					{ id: CrosspointControlSourceSelection.PGM, label: 'PGM' },
					{ id: CrosspointControlSourceSelection.PVW, label: 'PVW' },
					{ id: CrosspointControlSourceSelection.AUX1, label: 'AUX 1' },
					{ id: CrosspointControlSourceSelection.AUX2, label: 'AUX 2' },
					{ id: CrosspointControlSourceSelection.IPOUT1, label: 'IP OUT 1' },
					{ id: CrosspointControlSourceSelection.IPOUT2, label: 'IP OUT 2' },
					{ id: CrosspointControlSourceSelection.CLOCK, label: 'CLOCK' },
				],
				default: CrosspointControlSourceSelection.IN1,
				allowCustom: false,
			},
		]
	},
	setSourceNameDisplay: (): SomeCompanionActionInputField[] => {
		return [
			{
				type: 'dropdown',
				id: 'classisfication',
				label: 'Classification',
				choices: [
					{ id: SourceNameClassicifcation.DEFAULT, label: 'DEFAULT' },
					{ id: SourceNameClassicifcation.USER, label: 'USER' },
				],
				default: SourceNameClassicifcation.DEFAULT,
				allowCustom: false,
			},
		]
	},
	setSourceName: (): SomeCompanionActionInputField[] => {
		return [
			{
				type: 'dropdown',
				id: 'source',
				label: 'Source',
				choices: [
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
				],
				default: SourceNameObject.IN1,
				allowCustom: false,
			},
			{
				type: 'textinput',
				id: 'name',
				label: 'Name',
				default: 'INPUT 1',
				useVariables: { local: true },
				tooltip: 'Maximum 12 Characters',
				regex: Regex.SOMETHING,
			},
		]
	},
	setKeySignalCoupling: (): SomeCompanionActionInputField[] => {
		return [
			{
				type: 'dropdown',
				id: 'status',
				label: 'Status',
				choices: [
					{ id: KeySignalCouplingStatus.FillToSource, label: 'FILL TO SOURCE' },
					{ id: KeySignalCouplingStatus.SourceToFill, label: 'SOURCE TO FILL' },
				],
				default: KeySignalCouplingStatus.FillToSource,
				allowCustom: false,
			},
			{
				type: 'static-text',
				id: 'info1',
				label: '',
				value: 'When a key fill signal is selected, the key source signal is also automatically switched',
				isVisible: (options) => {
					return options.status == KeySignalCouplingStatus.FillToSource.toString()
				},
			},
			{
				type: 'static-text',
				id: 'info2',
				label: '',
				value: 'When a key source signal is selected, the key fill signal is also automatically switched',
				isVisible: (options) => {
					return options.status == KeySignalCouplingStatus.SourceToFill.toString()
				},
			},
		]
	},
	setAuxTransition: (): SomeCompanionActionInputField[] => {
		return [
			{
				type: 'dropdown',
				id: 'source',
				label: 'Source',
				choices: [
					{ id: SettingForAuxTransitionSource.BKGD, label: 'BACKGROUND' },
					{ id: SettingForAuxTransitionSource.FTB, label: 'FTB' },
					{ id: SettingForAuxTransitionSource.KEY1, label: 'KEY 1' },
					{ id: SettingForAuxTransitionSource.KEY2, label: 'KEY 2' },
				],
				default: SettingForAuxTransitionSource.BKGD,
				allowCustom: false,
			},
			{
				type: 'dropdown',
				id: 'effect',
				label: 'Effect',
				choices: [
					{ id: SettingForAuxTransitionEffect.MIX, label: 'MIX' },
					{ id: SettingForAuxTransitionEffect.WIPE, label: 'WIPE' },
				],
				default: SettingForAuxTransitionEffect.MIX,
				allowCustom: false,
				isVisible: (options) => {
					return options.source == SettingForAuxTransitionSource.BKGD.toString()
				},
			},
			{
				type: 'dropdown',
				id: 'operation',
				label: 'Operation Setting',
				choices: [
					{ id: SettingForAuxTransitionOperationSetting.TiggerOn, label: 'Trigger ON' },
					{ id: SettingForAuxTransitionOperationSetting.OnTake, label: 'ON Take' },
					{ id: SettingForAuxTransitionOperationSetting.OffTake, label: 'OFF Take' },
				],
				default: SettingForAuxTransitionOperationSetting.TiggerOn,
				allowCustom: false,
			},
			{
				type: 'static-text',
				id: 'info1',
				label: '',
				value: 'Excluding when BKGD is selected',
				isVisible: (options) => {
					return options.operation != SettingForAuxTransitionOperationSetting.TiggerOn.toString()
				},
			},
		]
	},
	setCutTransition: (): SomeCompanionActionInputField[] => {
		return [
			{
				type: 'dropdown',
				id: 'source',
				label: 'Source',
				choices: [
					{ id: SettingForAuxTransitionSource.BKGD, label: 'BACKGROUND' },
					{ id: SettingForAuxTransitionSource.FTB, label: 'FTB' },
					{ id: SettingForAuxTransitionSource.KEY1, label: 'KEY 1' },
					{ id: SettingForAuxTransitionSource.KEY2, label: 'KEY 2' },
				],
				default: SettingForAuxTransitionSource.BKGD,
				allowCustom: false,
			},
			{
				type: 'static-text',
				id: 'info1',
				label: '',
				value: 'Setting for CUT Transition (trigger issued).',
			},
		]
	},
	setAutoTransitionTime: (): SomeCompanionActionInputField[] => {
		return [
			{
				type: 'dropdown',
				id: 'source',
				label: 'Source',
				choices: [
					{ id: SettingForAuxTransitionSource.BKGD, label: 'BACKGROUND' },
					{ id: SettingForAuxTransitionSource.FTB, label: 'FTB' },
					{ id: SettingForAuxTransitionSource.KEY1, label: 'KEY 1' },
					{ id: SettingForAuxTransitionSource.KEY2, label: 'KEY 2' },
				],
				default: SettingForAuxTransitionSource.BKGD,
				allowCustom: false,
			},
			{
				type: 'textinput',
				id: 'time',
				label: 'Time (Frames)',
				default: '0',
				useVariables: { local: true },
			},
			{
				type: 'static-text',
				id: 'info1',
				label: '',
				value: 'Transition time range 0 to 999 frames.',
			},
		]
	},
	setBusTransitionStatus: (): SomeCompanionActionInputField[] => {
		return [
			{
				type: 'dropdown',
				id: 'bus',
				label: 'Bus',
				choices: [
					{ id: BusType.AUX1, label: 'AUX 1' },
					{ id: BusType.AUX2, label: 'AUX 2' },
				],
				default: BusType.AUX2,
				allowCustom: false,
			},
			{
				type: 'dropdown',
				id: 'enable',
				label: 'Enable',
				choices: [
					{ id: BusTransitionResponseEnable.Enable, label: 'Enable' },
					{ id: BusTransitionResponseEnable.Disable, label: 'Disable' },
				],
				default: BusTransitionResponseEnable.Enable,
				allowCustom: false,
			},
			{
				type: 'textinput',
				id: 'time',
				label: 'Time (Frames)',
				default: '0',
				useVariables: { local: true },
			},
			{
				type: 'static-text',
				id: 'info1',
				label: '',
				value: 'Transition time range 0 to 999 frames.',
			},
		]
	},
	setTransitionPattern: (): SomeCompanionActionInputField[] => {
		return [
			{
				type: 'dropdown',
				id: 'type',
				label: 'Type',
				choices: [
					{ id: TransitionPatternQueryType.BKGD, label: 'BACKGROUND' },
					{ id: TransitionPatternQueryType.KEY1, label: 'KEY 1' },
				],
				default: TransitionPatternQueryType.BKGD,
				allowCustom: false,
			},
			{
				type: 'dropdown',
				id: 'pattern',
				label: 'Pattern',
				choices: [
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
				],
				default: TransitionPatternResponsePattern.WIPE01,
				allowCustom: false,
			},
		]
	},
	setPinP: (): SomeCompanionActionInputField[] => {
		return [
			{
				type: 'dropdown',
				id: 'target',
				label: 'Target',
				choices: [
					{ id: PinPStatusQueryTarget.PinPKEY1, label: 'KEY 1' },
					{ id: PinPStatusQueryTarget.PinPKEY2, label: 'KEY 2' },
				],
				default: PinPStatusQueryTarget.PinPKEY1,
				allowCustom: false,
			},
			{
				type: 'textinput',
				id: 'xPos',
				label: 'Central X Position',
				default: '0',
				useVariables: { local: true },
				tooltip: 'Range -100 to 100',
			},
			{
				type: 'textinput',
				id: 'yPos',
				label: 'Central Y Position',
				default: '0',
				useVariables: { local: true },
				tooltip: 'Range -100 to 100',
			},
			{
				type: 'textinput',
				id: 'size',
				label: 'Size',
				default: '50',
				useVariables: { local: true },
				tooltip: 'Range 0 to 100',
			},
			{
				type: 'dropdown',
				id: 'width',
				label: 'Border Width',
				choices: [
					{ id: PinPBorderWidth.None, label: 'None' },
					{ id: PinPBorderWidth.Small, label: 'Small' },
					{ id: PinPBorderWidth.Medium, label: 'Medium' },
					{ id: PinPBorderWidth.Large, label: 'Large' },
					{ id: PinPBorderWidth.NoneOfTheAbove, label: 'Unchanged' },
				],
				default: PinPBorderWidth.NoneOfTheAbove,
				allowCustom: false,
			},
			{
				type: 'dropdown',
				id: 'colour',
				label: 'Border Color',
				choices: [
					{ id: PinPBorderColor.Black, label: 'Black' },
					{ id: PinPBorderColor.Gray1, label: 'Gray 1' },
					{ id: PinPBorderColor.Gray2, label: 'Gray 2' },
					{ id: PinPBorderColor.White, label: 'White' },
					{ id: PinPBorderColor.NoneOfTheAbove, label: 'Unchanged' },
				],
				default: PinPBorderColor.NoneOfTheAbove,
				allowCustom: false,
			},
		]
	},
}

export const feedbackOptions = {
	setBusSource: (): SomeCompanionFeedbackInputField[] => {
		return [
			{
				type: 'dropdown',
				id: 'bus',
				label: 'Bus',
				choices: [
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
				],
				default: CrosspointControlBusSelection.PGM,
				allowCustom: false,
			},
			{
				type: 'dropdown',
				id: 'source',
				label: 'Source',
				choices: [
					{ id: CrosspointControlSourceSelection.IN1, label: 'INPUT 1' },
					{ id: CrosspointControlSourceSelection.IN2, label: 'INPUT 2' },
					{ id: CrosspointControlSourceSelection.IN3, label: 'INPUT 3' },
					{ id: CrosspointControlSourceSelection.IN4, label: 'INPUT 4' },
					{ id: CrosspointControlSourceSelection.IN5, label: 'INPUT 5' },
					{ id: CrosspointControlSourceSelection.IN6, label: 'INPUT 6' },
					{ id: CrosspointControlSourceSelection.IN7, label: 'INPUT 7' },
					{ id: CrosspointControlSourceSelection.IN8, label: 'INPUT 8' },
					{ id: CrosspointControlSourceSelection.IN9, label: 'INPUT 9' },
					{ id: CrosspointControlSourceSelection.AnalogIN, label: 'ANALOG IN' },
					{ id: CrosspointControlSourceSelection.CBGD1, label: 'CBGD 1' },
					{ id: CrosspointControlSourceSelection.CBGD2, label: 'CBGD 2' },
					{ id: CrosspointControlSourceSelection.CBAR, label: 'COLOR BARS' },
					{ id: CrosspointControlSourceSelection.BLACK, label: 'BLACK' },
					{ id: CrosspointControlSourceSelection.STILL1_V, label: 'STILL 1 - V' },
					{ id: CrosspointControlSourceSelection.STILL1_K, label: 'STILL 1 - K' },
					{ id: CrosspointControlSourceSelection.STILL2_V, label: 'STILL 2 - V' },
					{ id: CrosspointControlSourceSelection.STILL2_K, label: 'STILL 2 - K' },
					{ id: CrosspointControlSourceSelection.MV, label: 'MV' },
					{ id: CrosspointControlSourceSelection.KeyOUT, label: 'KEY OUT' },
					{ id: CrosspointControlSourceSelection.CLN, label: 'CLEAN' },
					{ id: CrosspointControlSourceSelection.PGM, label: 'PGM' },
					{ id: CrosspointControlSourceSelection.PVW, label: 'PVW' },
					{ id: CrosspointControlSourceSelection.AUX1, label: 'AUX 1' },
					{ id: CrosspointControlSourceSelection.AUX2, label: 'AUX 2' },
					{ id: CrosspointControlSourceSelection.IPOUT1, label: 'IP OUT 1' },
					{ id: CrosspointControlSourceSelection.IPOUT2, label: 'IP OUT 2' },
					{ id: CrosspointControlSourceSelection.CLOCK, label: 'CLOCK' },
				],
				default: CrosspointControlSourceSelection.IN1,
				allowCustom: false,
			},
		]
	},
}
