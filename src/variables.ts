import { CompanionVariableDefinition } from '@companion-module/base'
import type { AvHsw10 } from './main.js'

export function UpdateVariableDefinitions(self: AvHsw10): void {
	const variableDefs: CompanionVariableDefinition[] = []
	self.setVariableDefinitions(variableDefs)
}
