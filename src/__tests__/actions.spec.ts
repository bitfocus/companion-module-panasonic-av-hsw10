import { describe, expect, it } from 'vitest'
import { ActionId, pinpPosition, pinpSize, transitionTime } from '../actions.js'
import { CrosspointControlBusSelection, CrosspointControlSourceSelection, Messages } from '../enums.js'
import { actionDefinitions, fakeInstance, learnAction, runAction } from './fixtures.js'

describe('action callbacks', () => {
	// The arguments are written out as the switcher takes them, rather than taken from the enums
	it.each([
		[ActionId.SetBusSource, { bus: '113', source: '148' }, Messages.BusSettingControl, ['113', '148']],
		[ActionId.SetSourceNameDisplay, { classisfication: '01' }, Messages.SourceNameDisplay, ['0', '01']],
		[
			ActionId.SetSourceName,
			{ source: '227', name: '  CAMERA 1  ' },
			Messages.SourceNameSet,
			['00', '227', 'CAMERA 1'],
		],
		[ActionId.SetKeySignalCoupling, { status: '01' }, Messages.KeySignalCouplingSet, ['01']],
		[
			ActionId.SetAutoTransition,
			{ source: '04', effect: '01', operation: '2' },
			Messages.AutoTransitionSet,
			['04', '01', '2'],
		],
		[ActionId.SetCutTransition, { source: '06' }, Messages.CutTransitionSet, ['06']],
		[ActionId.SetAutoTransitionTime, { source: '00', time: 30 }, Messages.AutoTransitionTimeSet, ['00', '30']],
		[
			ActionId.SetBusTransitionStatus,
			{ bus: '01', enable: '02', time: 999 },
			Messages.BusTransitionStatusSet,
			['01', '02', '999'],
		],
		[ActionId.SetTransitionPattern, { type: '02', pattern: '16' }, Messages.TransitionPatternControl, ['02', '16']],
		[
			ActionId.SetPinP,
			{ target: '2', xPos: -25.5, yPos: 12.25, size: 50, width: '3', colour: '0' },
			Messages.PinPSet,
			['2', '-002550', '001225', '05000', '3', '0'],
		],
	])('%s sends %s, passing on the action signal', async (actionId, options, command, args) => {
		const fake = fakeInstance()
		const signal = new AbortController().signal
		await runAction(actionDefinitions(fake), actionId, options, signal)
		expect(fake.sendMessage).toHaveBeenCalledExactlyOnceWith(command, args, signal)
	})

	it('Source Name sends at most 12 characters', async () => {
		const fake = fakeInstance()
		await runAction(actionDefinitions(fake), ActionId.SetSourceName, { source: '01', name: 'ABCDEFGHIJKLMNOP' })
		expect(fake.sendMessage.mock.calls[0][1]).toEqual(['00', '01', 'ABCDEFGHIJKL'])
	})

	it('Picture In Picture leaves the border unchanged when an older action has no border options', async () => {
		const fake = fakeInstance()
		await runAction(actionDefinitions(fake), ActionId.SetPinP, { target: '1', xPos: 0, yPos: 0, size: 100 })
		expect(fake.sendMessage.mock.calls[0][1]).toEqual(['1', '000000', '000000', '10000', '4', '4'])
	})

	// Value mode is not validated by Companion, and a saved value can be one this version no longer offers
	it.each([
		[ActionId.SetBusSource, { bus: '1', source: '01' }, /Bus 1 is not valid/],
		[ActionId.SetBusSource, { bus: '01', source: 1 }, /Source 1 is not valid/],
		[ActionId.SetBusSource, { bus: '$(internal:x)', source: '01' }, /Bus \$\(internal:x\)/],
		[ActionId.SetKeySignalCoupling, { status: '02' }, /Status 02/],
		[ActionId.SetAutoTransitionTime, { source: '00', time: '30' }, /Transition time 30 is not a number/],
		[ActionId.SetAutoTransitionTime, { source: '00', time: Number.NaN }, /Transition time NaN/],
		[ActionId.SetBusTransitionStatus, { bus: '01', enable: '01' }, /Transition time undefined/],
		[ActionId.SetPinP, { target: '1', xPos: 0, yPos: null, size: 50 }, /Y position null/],
		[ActionId.SetPinP, { target: '3', xPos: 0, yPos: 0, size: 50 }, /Target 3/],
	])('%s refuses %o and sends nothing', async (actionId, options, error) => {
		const fake = fakeInstance()
		await expect(runAction(actionDefinitions(fake), actionId, options)).rejects.toThrow(error)
		expect(fake.sendMessage).not.toHaveBeenCalled()
	})
})

describe('action learn', () => {
	it('Bus Source learns only the source on its bus', async () => {
		const fake = fakeInstance()
		fake.self.state.setBusSource(CrosspointControlBusSelection.AUX1, CrosspointControlSourceSelection.CBAR)
		const defs = actionDefinitions(fake)
		await expect(learnAction(defs, ActionId.SetBusSource, { bus: '113', source: '01' })).resolves.toEqual({
			source: '147',
		})
	})

	it.each([{ bus: '01' }, { bus: 'PGM' }])(
		'Bus Source learns nothing for %o, whose source is not known',
		async (options) => {
			const fake = fakeInstance()
			fake.self.state.setBusSource(CrosspointControlBusSelection.AUX1, CrosspointControlSourceSelection.CBAR)
			await expect(learnAction(actionDefinitions(fake), ActionId.SetBusSource, options)).resolves.toBeUndefined()
		},
	)
})

describe('number encodings', () => {
	it.each([
		[30, '30'],
		[0, '0'],
		[-5, '0'],
		[1200, '999'],
		[12.6, '13'],
	])('transition time %d is sent as %s', (time, expected) => {
		expect(transitionTime(time)).toBe(expected)
	})

	it.each([
		[0, '000000'],
		[100, '010000'],
		[-100, '-010000'],
		[150, '010000'],
		[-0.001, '000000'],
		// 0.29 × 100 is 28.999999999999996 in floating point, which flooring sent as 28
		[0.29, '000029'],
		[-0.57, '-000057'],
		[33.33, '003333'],
	])('PinP position %d is sent as %s', (position, expected) => {
		expect(pinpPosition(position, 'X position')).toBe(expected)
	})

	it.each([
		[50, '05000'],
		[0, '00000'],
		[100, '10000'],
		[-1, '00000'],
		[0.29, '00029'],
	])('PinP size %d is sent as %s', (size, expected) => {
		expect(pinpSize(size)).toBe(expected)
	})
})

describe('action options', () => {
	type Field = { id: string; type: string; disableAutoExpression?: boolean; isVisibleExpression?: string }
	const fields = (actionId: ActionId): Field[] => {
		const def = actionDefinitions(fakeInstance())[actionId]
		if (!def) throw new Error(`${actionId} is not defined`)
		return def.options
	}
	const field = (actionId: ActionId, id: string): Field => {
		const found = fields(actionId).find((option) => option.id === id)
		if (!found) throw new Error(`${actionId} has no ${id}`)
		return found
	}

	it('take the bus and source by expression, no longer as custom values', () => {
		for (const option of fields(ActionId.SetBusSource)) {
			expect(option).toMatchObject({ type: 'dropdown', expressionDescription: expect.stringMatching(/code/) })
			expect(option).not.toHaveProperty('allowCustom')
			expect(option).not.toHaveProperty('disableAutoExpression')
		}
	})

	it('make the numbers that were text inputs number fields', () => {
		expect(field(ActionId.SetAutoTransitionTime, 'time')).toMatchObject({ type: 'number', min: 0, max: 999 })
		expect(field(ActionId.SetBusTransitionStatus, 'time')).toMatchObject({ type: 'number', min: 0, max: 999 })
		expect(field(ActionId.SetPinP, 'xPos')).toMatchObject({ type: 'number', min: -100, max: 100, default: 0 })
		expect(field(ActionId.SetPinP, 'yPos')).toMatchObject({ type: 'number', min: -100, max: 100, default: 0 })
		expect(field(ActionId.SetPinP, 'size')).toMatchObject({ type: 'number', min: 0, max: 100, default: 50 })
	})

	// Companion can only read a field that cannot be an expression from an isVisibleExpression
	it('let every field an isVisibleExpression reads be read', () => {
		for (const actionId of Object.values(ActionId)) {
			const options = fields(actionId)
			for (const option of options) {
				for (const [, id] of option.isVisibleExpression?.matchAll(/\$\(options:(\w+)\)/g) ?? []) {
					expect(options.find((o) => o.id === id)?.disableAutoExpression, `${actionId} ${option.id} reads ${id}`).toBe(
						true,
					)
				}
			}
		}
	})

	it('show each piece of information only where it applies', () => {
		expect(field(ActionId.SetKeySignalCoupling, 'info1').isVisibleExpression).toBe(`$(options:status) == '00'`)
		expect(field(ActionId.SetKeySignalCoupling, 'info2').isVisibleExpression).toBe(`$(options:status) == '01'`)
		expect(field(ActionId.SetAutoTransition, 'effect').isVisibleExpression).toBe(`$(options:source) == '00'`)
		expect(field(ActionId.SetAutoTransition, 'info1').isVisibleExpression).toBe(`$(options:operation) != '0'`)
	})
})
