import {
    ADDRESS_LENGTH,
    ALLOWED_TIMESTAMP_LENGTH,
    AUCTION_BUMP_LENGTH,
    AUCTION_DELAY_LENGTH,
    CONTRACT_TAKER_FEE_PRECISION,
    FLAGS_LENGTH,
    HAS_TAKING_FEE_FLAG,
    POINTS_LENGTH_MASK,
    PRIVATE_AUCTION_DEADLINE_LENGTH,
    RESOLVERS_LENGTH_MASK,
    RESOLVERS_LENGTH_OFFSET,
    TAKER_FEE_RATIO_LENGTH,
    TAKER_FEE_RECEIVER_LENGTH
} from './constants'
import {BigNumber} from '@ethersproject/bignumber'
import {
    InteractionAdditionalInfo,
    InteractionFlags,
    ParsedAuctionParams,
    PrivateAuctionDeadline,
    ResolversWhitelist,
    TakerFeeData
} from './types'
import {ZERO_ADDRESS} from '../../constants'
import {add0x} from '../../utils'
import {BadOrderSuffixError} from './errors'
import {AuctionPoint, AuctionWhitelistItem} from '../types'

/**
 *    Order.interactions suffix structure:
 *    M*(1 + 3 bytes)  - auction points coefficients with seconds delays
 *    N*(4 + 20 bytes) - resolver with corresponding time limit
 *    4 bytes          - public time limit
 *    32 bytes         - taking fee (optional if flags has _HAS_TAKING_FEE_FLAG)
 *    1 byte           - flags
 * @param interactions
 */
export function parseInteractionsSuffix(
    interactions: string
): InteractionAdditionalInfo {
    const flags = parseFlags(interactions)

    if (interactions.length < minInteractionsLength(flags)) {
        throw new BadOrderSuffixError('wrong interactions length')
    }

    const interactionsWithoutFlags = interactions.slice(0, -FLAGS_LENGTH)

    const {
        takerFeeReceiver,
        takerFeeRatio,
        interactions: interactionsNoTakingFee
    } = parseTakingFeeAndReturnRemainingInteractions(
        flags,
        interactionsWithoutFlags
    )

    const {deadline, interactions: interactionsNoDeadline} =
        parsePrivateAuctionDeadline(interactionsNoTakingFee)

    const {whitelist, interactions: interactionsWithoutWhitelist} =
        parseResolversWhitelist(flags, interactionsNoDeadline)

    const {points} = parseAuctionParams(flags, interactionsWithoutWhitelist)

    return {
        whitelist,
        publicResolvingDeadline: deadline,
        takerFeeReceiver,
        takerFeeRatio,
        points
    }
}

export function minInteractionsLength(flags: InteractionFlags): number {
    const auctionPointsLen =
        flags.pointsCount * (AUCTION_DELAY_LENGTH + AUCTION_BUMP_LENGTH)
    const whitelistLen =
        flags.resolversCount * (ALLOWED_TIMESTAMP_LENGTH + ADDRESS_LENGTH)

    const requiredLength =
        auctionPointsLen +
        whitelistLen +
        PRIVATE_AUCTION_DEADLINE_LENGTH +
        FLAGS_LENGTH

    if (flags.takingFeeEnabled) {
        return (
            requiredLength + TAKER_FEE_RECEIVER_LENGTH + TAKER_FEE_RATIO_LENGTH
        )
    }

    return requiredLength
}

export function parseTakingFeeAndReturnRemainingInteractions(
    flags: InteractionFlags,
    interactions: string
): TakerFeeData {
    if (!flags.takingFeeEnabled) {
        return {
            interactions,
            takerFeeReceiver: ZERO_ADDRESS,
            takerFeeRatio: '0'
        }
    }

    const takerFeeDataLen = TAKER_FEE_RECEIVER_LENGTH + TAKER_FEE_RATIO_LENGTH

    const takerFeeData = interactions.slice(-takerFeeDataLen)

    const takerFeeReceiverHex = takerFeeData.slice(TAKER_FEE_RATIO_LENGTH)
    const takerFeeReceiver = add0x(takerFeeReceiverHex)

    if (takerFeeReceiver === ZERO_ADDRESS) {
        throw new BadOrderSuffixError('takerFeeReceiver cannot be zero address')
    }

    const takerFeeRateHex = takerFeeData.slice(0, TAKER_FEE_RATIO_LENGTH)
    const takerFeeRatio = BigNumber.from(add0x(takerFeeRateHex))

    if (takerFeeRatio.gt(CONTRACT_TAKER_FEE_PRECISION)) {
        throw new BadOrderSuffixError('takerFeeRatio cannot be > 1e9')
    }

    return {
        interactions: interactions.slice(0, -takerFeeDataLen),
        takerFeeReceiver,
        takerFeeRatio: takerFeeRatio.toString()
    }
}

export function parsePrivateAuctionDeadline(
    interactions: string
): PrivateAuctionDeadline {
    const privateAuctionDeadlineHex = interactions.slice(
        -PRIVATE_AUCTION_DEADLINE_LENGTH
    )
    const privateAuctionDeadline = Number.parseInt(
        privateAuctionDeadlineHex,
        16
    )

    if (!privateAuctionDeadline) {
        throw new BadOrderSuffixError(
            `Invalid public resolving deadline in interactions`
        )
    }

    return {
        deadline: privateAuctionDeadline,
        interactions: interactions.slice(0, -PRIVATE_AUCTION_DEADLINE_LENGTH)
    }
}

export function parseResolversWhitelist(
    flags: InteractionFlags,
    interactions: string
): ResolversWhitelist {
    const whitelist: AuctionWhitelistItem[] = []

    const allowedTsAndResolverLen = ADDRESS_LENGTH + ALLOWED_TIMESTAMP_LENGTH

    const addressesPacked = interactions.slice(
        -1 * flags.resolversCount * allowedTsAndResolverLen
    )

    if (addressesPacked.length % allowedTsAndResolverLen) {
        throw new BadOrderSuffixError(
            `Invalid whitelist addresses in interactions`
        )
    }

    for (let i = 0; i < addressesPacked.length; i += allowedTsAndResolverLen) {
        const tsAndAddress = addressesPacked.slice(
            i,
            i + allowedTsAndResolverLen
        )
        const timestampHex = tsAndAddress.slice(0, ALLOWED_TIMESTAMP_LENGTH)
        const address = tsAndAddress.slice(ALLOWED_TIMESTAMP_LENGTH)

        const timestamp = Number.parseInt(timestampHex, 16)

        if (timestamp !== 0 && !timestamp) {
            throw new BadOrderSuffixError(
                `Invalid resolver allowance timestamp`
            )
        }

        whitelist.push({
            address: add0x(address).toLowerCase(),
            allowance: timestamp
        })
    }

    return {
        whitelist,
        interactions: interactions.slice(
            0,
            -(flags.resolversCount * allowedTsAndResolverLen)
        )
    }
}

export function parseAuctionParams(
    flags: InteractionFlags,
    interactions: string
): ParsedAuctionParams {
    if (flags.pointsCount === 0) {
        return {
            interactions,
            points: []
        }
    }

    const points: AuctionPoint[] = []

    const auctionParamsLength = AUCTION_DELAY_LENGTH + AUCTION_BUMP_LENGTH

    const paramsPacked = interactions.slice(
        -1 * flags.pointsCount * auctionParamsLength
    )

    if (paramsPacked.length % auctionParamsLength) {
        throw new BadOrderSuffixError(`Invalid auction params in interactions`)
    }

    for (let i = 0; i < paramsPacked.length; i += auctionParamsLength) {
        const durationAndBump = paramsPacked.slice(i, i + auctionParamsLength)
        const durationHex = durationAndBump.slice(0, AUCTION_DELAY_LENGTH)
        const bumpHex = durationAndBump.slice(AUCTION_DELAY_LENGTH)

        const duration = Number.parseInt(durationHex, 16)

        if (!duration) {
            throw new BadOrderSuffixError(`Invalid auction point duration`)
        }

        const bump = Number.parseInt(bumpHex, 16)

        if (!bump) {
            throw new BadOrderSuffixError(`Invalid auction point bump`)
        }

        points.push({delay: duration, coefficient: bump})
    }

    return {
        points,
        interactions: interactions.slice(
            0,
            flags.pointsCount * auctionParamsLength
        )
    }
}

export function parseFlags(interactions: string): InteractionFlags {
    const flagsHex = interactions.slice(-FLAGS_LENGTH)

    if (flagsHex.length < FLAGS_LENGTH) {
        throw new BadOrderSuffixError(`Invalid flags length`)
    }

    const flags = Number.parseInt(flagsHex, 16)

    if (!flags) {
        throw new BadOrderSuffixError(`cannot parse flags`)
    }

    const resolversCount =
        (flags & RESOLVERS_LENGTH_MASK) >> RESOLVERS_LENGTH_OFFSET

    if (resolversCount === 0) {
        throw new BadOrderSuffixError(`cannot have 0 resolvers`)
    }

    const takingFeeEnabled = (flags & HAS_TAKING_FEE_FLAG) !== 0

    const pointsCount = flags & POINTS_LENGTH_MASK

    return {
        pointsCount,
        takingFeeEnabled,
        resolversCount
    }
}
