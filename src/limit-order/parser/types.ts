import {DynamicField} from './constants'

export type InteractionField = keyof typeof DynamicField

export type ParsedInteractions = Record<InteractionField, string>
