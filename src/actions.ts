import type { AvHsw10 } from './main.js'
import { CompanionActionDefinition } from '@companion-module/base'

import { actionOptions } from './options.js'
import { Messages } from './enums.js'

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

export function UpdateActions(self: AvHsw10): void {
	const actionDefs: { [id in ActionId]: CompanionActionDefinition | undefined } = {
		[ActionId.SetBusSource]: {
			name: 'Bus Source',
			options: actionOptions.setBusSource(),
			callback: async (action, context) => {
				const bus = (await context.parseVariablesInString(action.options.bus?.toString() ?? '')).trim()
				const src = (await context.parseVariablesInString(action.options.source?.toString() ?? '')).trim()
				await self.sendMessage(Messages.BusSettingControl, bus, src)
			},
			subscribe: async (action, context) => {
				const bus = (await context.parseVariablesInString(action.options.bus?.toString() ?? '')).trim()
				await self.sendMessage(Messages.BusCrosspointQuery, bus)
			},
		},
		[ActionId.SetSourceNameDisplay]: {
			name: 'Source Name Display',
			options: actionOptions.setSourceNameDisplay(),
			callback: async (action, context) => {
				self.logger.debug(action)
				const classisfication = (
					await context.parseVariablesInString(action.options.classisfication?.toString() ?? '')
				).trim()
				await self.sendMessage(Messages.SourceNameDisplay, '0', classisfication)
			},
		},
		[ActionId.SetSourceName]: {
			name: 'Source Name',
			options: actionOptions.setSourceNameDisplay(),
			callback: async (action, context) => {
				self.logger.debug(action)
				const source = (await context.parseVariablesInString(action.options.source?.toString() ?? '')).trim()
				const name = (await context.parseVariablesInString(action.options.name?.toString() ?? ''))
					.trim()
					.substring(0, 12)
				await self.sendMessage(Messages.SourceNameSet, '00', source, name)
			},
		},
		[ActionId.SetKeySignalCoupling]: {
			name: 'Key Signal Coupling',
			options: actionOptions.setKeySignalCoupling(),
			callback: async (action, context) => {
				self.logger.debug(action)
				const status = (await context.parseVariablesInString(action.options.status?.toString() ?? '')).trim()
				await self.sendMessage(Messages.KeySignalCouplingSet, status)
			},
		},
		[ActionId.SetAutoTransition]: {
			name: 'Auto Transition',
			options: actionOptions.setAuxTransition(),
			callback: async (action, context) => {
				self.logger.debug(action)
				const source = (await context.parseVariablesInString(action.options.source?.toString() ?? '')).trim()
				const effect = (await context.parseVariablesInString(action.options.effect?.toString() ?? '')).trim()
				const operation = (await context.parseVariablesInString(action.options.operation?.toString() ?? '')).trim()
				await self.sendMessage(Messages.AutoTransitionSet, source, effect, operation)
			},
		},
		[ActionId.SetCutTransition]: {
			name: 'Cut Transition',
			options: actionOptions.setCutTransition(),
			callback: async (action, context) => {
				self.logger.debug(action)
				const source = (await context.parseVariablesInString(action.options.source?.toString() ?? '')).trim()
				await self.sendMessage(Messages.CutTransitionSet, source)
			},
		},
		[ActionId.SetAutoTransitionTime]: {
			name: 'Auto Transition Time',
			options: actionOptions.setAutoTransitionTime(),
			callback: async (action, context) => {
				self.logger.debug(action)
				const source = (await context.parseVariablesInString(action.options.source?.toString() ?? '')).trim()
				let time = Number.parseInt(await context.parseVariablesInString(action.options.time?.toString() ?? ''))
				if (Number.isNaN(time)) {
					self.log('warn', `Transition time must be a number`)
				}
				time = time > 999 ? 999 : time < 0 ? 0 : time
				await self.sendMessage(Messages.AutoTransitionTimeSet, source, time.toString())
			},
		},
		[ActionId.SetBusTransitionStatus]: {
			name: 'Bus Transition Status',
			options: actionOptions.setBusTransitionStatus(),
			callback: async (action, context) => {
				self.logger.debug(action)
				const bus = (await context.parseVariablesInString(action.options.bus?.toString() ?? '')).trim()
				const enable = (await context.parseVariablesInString(action.options.enable?.toString() ?? '')).trim()
				let time = Number.parseInt(await context.parseVariablesInString(action.options.time?.toString() ?? ''))
				if (Number.isNaN(time)) {
					self.log('warn', `Transition time must be a number`)
				}
				time = time > 999 ? 999 : time < 0 ? 0 : time
				await self.sendMessage(Messages.BusTransitionStatusSet, bus, enable, time.toString())
			},
		},
		[ActionId.SetTransitionPattern]: {
			name: 'Transition Pattern',
			options: actionOptions.setTransitionPattern(),
			callback: async (action, context) => {
				self.logger.debug(action)
				const type = (await context.parseVariablesInString(action.options.type?.toString() ?? '')).trim()
				const pattern = (await context.parseVariablesInString(action.options.pattern?.toString() ?? '')).trim()
				await self.sendMessage(Messages.TransitionPatternControl, type, pattern)
			},
		},
		[ActionId.SetPinP]: {
			name: 'Picture In Picture',
			options: actionOptions.setPinP(),
			callback: async (action, context) => {
				self.logger.debug(action)
				const target = (await context.parseVariablesInString(action.options.target?.toString() ?? '')).trim()
				let xPos = Number.parseFloat(await context.parseVariablesInString(action.options.xPos?.toString() ?? ''))
				let yPos = Number.parseFloat(await context.parseVariablesInString(action.options.yPos?.toString() ?? ''))
				let size = Number.parseFloat(await context.parseVariablesInString(action.options.size?.toString() ?? ''))
				const width = (await context.parseVariablesInString(action.options.width?.toString() ?? '')).trim()
				const color = (await context.parseVariablesInString(action.options.color?.toString() ?? '')).trim()
				if (isNaN(xPos) || isNaN(yPos) || isNaN(size)) {
					self.logger.warn(
						`Picture in Picture supplied invalid position/size arguments - must be numbers ${action.options.xPos}, ${action.options.yPos}, ${action.options.size}`,
					)
					return
				}
				xPos = xPos > 100 ? 100 : xPos < -100 ? -100 : xPos
				yPos = yPos > 100 ? 100 : xPos < -100 ? -100 : yPos
				size = size > 100 ? 100 : size < 0 ? 0 : size
				let xPosStr = Math.floor(xPos * 100)
					.toString()
					.substring(0, 6)
				let yPosStr = Math.floor(yPos * 100)
					.toString()
					.substring(0, 6)
				let sizeStr = Math.floor(size * 100)
					.toString()
					.substring(0, 5)
				while (xPosStr.length < 6) xPosStr = '0' + xPosStr
				while (yPosStr.length < 6) yPosStr = '0' + yPosStr
				while (sizeStr.length < 5) sizeStr = '0' + sizeStr
				await self.sendMessage(Messages.PinPSet, target, xPosStr, yPosStr, sizeStr, width, color)
			},
		},
	}
	self.setActionDefinitions(actionDefs)
}
