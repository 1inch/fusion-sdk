import {toBN, trim0x} from '../utils'
import {DynamicField} from './constants'
import BN from 'bn.js'
import {InteractionField, ParsedInteractions} from './types'

export function parseInteractions(
    offsets: string,
    interactions: string
): ParsedInteractions {
    const offsetsBN = toBN(offsets)

    const parsedInteractions = {} as ParsedInteractions

    interactions = trim0x(interactions)

    for (const interactionName in DynamicField) {
        const field = interactionName as InteractionField
        parsedInteractions[field] = parseInteractionForField(
            offsetsBN,
            interactions,
            DynamicField[field]
        )
    }

    return parsedInteractions
}

function parseInteractionForField(
    offsets: BN,
    interactions: string,
    field: number
): string {
    const {fromByte, toByte} = getOffsetForInteraction(offsets, field)

    return '0x' + interactions.slice(fromByte * 2, toByte * 2)
}

function getOffsetForInteraction(
    offsets: BN,
    field: number
): {fromByte: number; toByte: number} {
    const fromByteBN =
        field === 0 ? '0' : offsets.shrn((field - 1) * 32).maskn(32)
    const toByteBN = offsets.shrn(field * 32).maskn(32)

    return {
        fromByte: parseInt(fromByteBN.toString()),
        toByte: parseInt(toByteBN.toString())
    }
}
