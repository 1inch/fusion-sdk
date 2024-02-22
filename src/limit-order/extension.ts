import {keccak256} from 'ethers'
import {trim0x} from '../utils'
import assert from 'assert'
import {isHexString} from '../validations'
import {ZX} from '../constants'

export class Extension {
    public readonly makerAssetSuffix: string = ZX

    public readonly takerAssetSuffix: string = ZX

    public readonly makingAmountData: string = ZX

    public readonly takingAmountData: string = ZX

    public readonly predicate: string = ZX

    public readonly makerPermit: string = ZX

    public readonly preInteraction: string = ZX

    public readonly postInteraction: string = ZX

    public readonly customData: string = ZX

    constructor(
        data = {
            makerAssetSuffix: ZX,
            takerAssetSuffix: ZX,
            makingAmountData: ZX,
            takingAmountData: ZX,
            predicate: ZX,
            makerPermit: ZX,
            preInteraction: ZX,
            postInteraction: ZX,
            customData: ZX
        }
    ) {
        Object.entries(data).forEach(([key, val]) =>
            assert(
                isHexString(val) || val === ZX,
                `${key} must be valid hex string`
            )
        )

        this.makerAssetSuffix = data.makerAssetSuffix
        this.takerAssetSuffix = data.takerAssetSuffix
        this.makingAmountData = data.makingAmountData
        this.takingAmountData = data.takingAmountData
        this.predicate = data.predicate
        this.makerPermit = data.makerPermit
        this.preInteraction = data.preInteraction
        this.postInteraction = data.postInteraction
        this.customData = data.customData
    }

    static default(): Extension {
        return new Extension()
    }

    public keccak256(): bigint {
        return BigInt(keccak256(this.encode()))
    }

    public isEmpty(): boolean {
        const allInteractions = [
            this.makerAssetSuffix,
            this.takerAssetSuffix,
            this.makingAmountData,
            this.takingAmountData,
            this.predicate,
            this.makerPermit,
            this.preInteraction,
            this.postInteraction
        ]
        const allInteractionsConcat =
            allInteractions.map(trim0x).join('') + trim0x(this.customData)

        return allInteractionsConcat.length === 0
    }

    /**
     * Hex string with 0x
     */
    public encode(): string {
        const allInteractions = [
            this.makerAssetSuffix,
            this.takerAssetSuffix,
            this.makingAmountData,
            this.takingAmountData,
            this.predicate,
            this.makerPermit,
            this.preInteraction,
            this.postInteraction
        ]

        const allInteractionsConcat =
            allInteractions.map(trim0x).join('') + trim0x(this.customData)

        // https://stackoverflow.com/a/55261098/440168
        const cumulativeSum = (
            (sum) =>
            (value: number): number => {
                sum += value

                return sum
            }
        )(0)
        const offsets = allInteractions
            .map((a) => a.length / 2 - 1)
            .map(cumulativeSum)
            .reduce((acc, a, i) => acc + (BigInt(a) << BigInt(32 * i)), 0n)

        let extension = '0x'

        if (allInteractionsConcat.length > 0) {
            extension +=
                offsets.toString(16).padStart(64, '0') + allInteractionsConcat
        }

        return extension
    }
}
