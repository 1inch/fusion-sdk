import {toBN} from '../../utils'
import {BigNumber} from '@ethersproject/bignumber'
import {
    DURATION_MASK,
    DURATION_SHIFT,
    FEE_MASK,
    FEE_SHIFT,
    INITIAL_RATE_BUMP_MASK,
    INITIAL_RATE_BUMP_SHIFT,
    SALT_MASK,
    TIME_START_MASK,
    TIME_START_SHIFT
} from './constants'

export function getStartTime(salt: string): BigNumber {
    const val = toBN(salt).and(TIME_START_MASK).shrn(TIME_START_SHIFT)

    return BigNumber.from(val.toString())
}

export function getDuration(salt: string): BigNumber {
    const val = toBN(salt).and(DURATION_MASK).shrn(DURATION_SHIFT)

    return BigNumber.from(val.toString())
}

export function getInitialRateBump(salt: string): BigNumber {
    const val = toBN(salt)
        .and(INITIAL_RATE_BUMP_MASK)
        .shrn(INITIAL_RATE_BUMP_SHIFT)

    return BigNumber.from(val.toString())
}

export function getFee(salt: string): BigNumber {
    const val = toBN(salt).and(FEE_MASK).shrn(FEE_SHIFT)

    return BigNumber.from(val.toString())
}

export function getSalt(salt: string): BigNumber {
    const val = toBN(salt).and(SALT_MASK)

    return BigNumber.from(val.toString())
}
