import assert from 'assert';
import {toBN} from '../utils';
import {AuctionSaltData} from './types';
import {randomInt} from 'crypto';

export class AuctionSalt {
    private readonly auctionStartTime: number

    private readonly initialRateBump: number

    private readonly duration: number

    private readonly bankFee: string

    private readonly salt: string

    constructor(auction: AuctionSaltData) {
        this.salt = randomInt(10000).toString() // salt <= uint176
        this.auctionStartTime = auction.auctionStartTime
        this.initialRateBump = auction.initialRateBump
        this.duration = auction.duration
        this.bankFee = auction.bankFee
    }

    build(): string {
        const res =
            toBN(this.auctionStartTime).toString('hex').padStart(8, '0') +
            toBN(this.duration).toString('hex').padStart(6, '0') +
            toBN(this.initialRateBump).toString('hex').padStart(6, '0') +
            toBN(this.bankFee)
                .toString('hex')
                .padStart(8, '0') +
            toBN(this.salt)
                .toString('hex')
                .padStart(36, '0')

        assert(res.length === 64, 'Some inputs were out of allowed ranges')

        return toBN(('0x' + res)).toString()
    }
}
