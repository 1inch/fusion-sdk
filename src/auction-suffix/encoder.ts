import {BigNumber} from '@ethersproject/bignumber';
import {trim0x} from '../utils';
import {AuctionPoint, AuctionWhitelistItem} from './types';
import {ZERO_ADDRESS} from '../constants';

export function encodeAuctionParams(points: AuctionPoint[]): string {
    return points
        .map(
            ({delay, coefficient}) =>
                delay.toString(16).padStart(4, '0') +
                coefficient.toString(16).padStart(6, '0')
        )
        .join('')
}

export function encodeWhitelist(whitelist: AuctionWhitelistItem[]): string {
    return whitelist
        .map(
            ({address, allowance}) =>
                allowance.toString(16).padStart(8, '0') + trim0x(address)
        )
        .join('')
}

export function encodePublicResolvingDeadline(deadline: number): string {
    return deadline.toString(16).padStart(8, '0')
}

export function encodeTakingFeeData(
    takerFeeReceiver: string,
    takerFeeRatio: string
): string {
    if (takerFeeReceiver === ZERO_ADDRESS || takerFeeRatio === '0') {
        return ''
    }

    return (
        BigNumber.from(takerFeeRatio)
            .toHexString()
            .substring(2)
            .padStart(24, '0') + trim0x(takerFeeReceiver)
    )
}

export function encodeFlags(
    whitelist: AuctionWhitelistItem[],
    points: AuctionPoint[],
    takingFeeData: string
): string {
    if (points.length > 8) {
        throw new Error('max points count = 8')
    }

    let flags = (whitelist.length << 3) | points.length

    if (takingFeeData !== '') {
        flags |= 0x80
    }

    return flags.toString(16).padStart(2, '0')
}
