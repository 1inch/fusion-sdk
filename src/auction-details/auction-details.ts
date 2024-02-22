import {trim0x} from '../utils'
import {ethers} from 'ethers'
import assert from 'assert'
import {isHexBytes} from '../validations'
import {AuctionPoint} from './types'
import {BytesIter} from '../bytes-iter'

export class AuctionDetails {
    public readonly auctionStartTime: bigint

    public readonly duration: bigint

    public readonly initialRateBump: bigint

    public readonly points: AuctionPoint[]

    constructor(auction: {
        auctionStartTime: bigint
        initialRateBump: number
        duration: number
        points: AuctionPoint[]
    }) {
        this.auctionStartTime = BigInt(auction.auctionStartTime)
        this.initialRateBump = BigInt(auction.initialRateBump)
        this.duration = BigInt(auction.duration)
        this.points = auction.points
    }

    /**
     * Construct `AuctionDetails` from bytes
     *
     * @param data bytes with 0x prefix in next format:
     * - uint32 auctionStartTime
     * - uint24 duration
     * - uint24 initialRateBump
     * - [uint24 rate, uint16 delay] * N points
     *
     * All data is tight packed
     *
     * @see AuctionDetails.encode
     */
    static decode(data: string): AuctionDetails {
        assert(isHexBytes(data), 'Invalid auction details data')
        const iter = new BytesIter(data)

        const start = iter.nextUint32()
        const duration = Number(iter.nextUint24())
        const rateBump = Number(iter.nextUint24())
        const points = [] as AuctionPoint[]

        while (!iter.isEmpty()) {
            points.push({
                coefficient: Number(iter.nextUint24()),
                delay: Number(iter.nextUint16())
            })
        }

        return new AuctionDetails({
            auctionStartTime: start,
            duration: duration,
            initialRateBump: rateBump,
            points
        })
    }

    /**
     * Serialize auction data to bytes
     */
    public encode(): string {
        let details = ethers.solidityPacked(
            ['uint32', 'uint24', 'uint24'],
            [this.auctionStartTime, this.duration, this.initialRateBump]
        )

        for (let i = 0; i < this.points.length; i++) {
            details += trim0x(
                ethers.solidityPacked(
                    ['uint24', 'uint16'],
                    [this.points[i].coefficient, this.points[i].delay]
                )
            )
        }

        return details
    }
}
