import {BytesIter, UINT_256_MAX} from '@1inch/byte-utils'
import {Bps} from '@1inch/limit-order-sdk'
import assert from 'assert'

export class SurplusParams {
    static NO_FEE = new SurplusParams(UINT_256_MAX, Bps.ZERO)

    constructor(
        public readonly estimatedTakerAmount: bigint,
        public readonly protocolFee: Bps
    ) {
        assert(
            protocolFee.value % 100n == 0n,
            'only integer percent supported for protocolFee'
        )
    }

    /**
     * Create `SurplusParams` from encoded bytes
     * @param bytes
     * - `32 bytes` - estimatedTakerAmount
     * - `1 byte` - protocolFee
     */
    static decodeFrom<T extends string | bigint>(
        bytes: BytesIter<T>
    ): SurplusParams {
        const amount = BigInt(bytes.nextUint256())
        const protocolFee = new Bps(BigInt(bytes.nextUint8()) * 100n)

        return new SurplusParams(amount, protocolFee)
    }
}
