import assert from 'assert'
import {toBN} from '../utils'
import {AuctionSaltData} from './types'
import {
    getDuration,
    getFee,
    getInitialRateBump,
    getSalt,
    getStartTime,
    SALT_MASK
} from './parser'
import {randomIntString} from './rand'

export class AuctionSalt {
    public readonly auctionStartTime: number

    public readonly initialRateBump: number

    public readonly duration: number

    public readonly bankFee: string

    public readonly salt: string

    constructor(auction: AuctionSaltData) {
        if (auction.salt && SALT_MASK.lt(toBN(auction.salt))) {
            throw new Error('salt should be less 18 bytes')
        }

        this.salt = auction.salt || randomIntString(5)
        this.auctionStartTime = auction.auctionStartTime
        this.initialRateBump = auction.initialRateBump
        this.duration = auction.duration
        this.bankFee = auction.bankFee
    }

    static decode(salt: string): AuctionSalt {
        return new AuctionSalt({
            salt: getSalt(salt).toString(),
            auctionStartTime: getStartTime(salt).toNumber(),
            duration: getDuration(salt).toNumber(),
            bankFee: getFee(salt).toString(),
            initialRateBump: getInitialRateBump(salt).toNumber()
        })
    }

    build(): string {
        const res =
            toBN(this.auctionStartTime).toString('hex').padStart(8, '0') +
            toBN(this.duration).toString('hex').padStart(6, '0') +
            toBN(this.initialRateBump).toString('hex').padStart(6, '0') +
            toBN(this.bankFee).toString('hex').padStart(8, '0') +
            toBN(this.salt).toString('hex').padStart(36, '0')

        assert(res.length === 64, 'Some inputs were out of allowed ranges')

        return toBN('0x' + res).toString()
    }
}
