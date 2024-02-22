import {add0x} from '../utils'
import {BN} from '../bn'
import {Address} from '../address'
import {BitMask} from '../bit-mask'

/**
 * The MakerTraits type is an uint256, and different parts of the number are used to encode different traits.
 * High bits are used for flags
 * 255 bit `NO_PARTIAL_FILLS_FLAG`          - if set, the order does not allow partial fills
 * 254 bit `ALLOW_MULTIPLE_FILLS_FLAG`      - if set, the order permits multiple fills
 * 253 bit                                  - unused
 * 252 bit `PRE_INTERACTION_CALL_FLAG`      - if set, the order requires pre-interaction call
 * 251 bit `POST_INTERACTION_CALL_FLAG`     - if set, the order requires post-interaction call
 * 250 bit `NEED_CHECK_EPOCH_MANAGER_FLAG`  - if set, the order requires to check the epoch manager
 * 249 bit `HAS_EXTENSION_FLAG`             - if set, the order has extension(s)
 * 248 bit `USE_PERMIT2_FLAG`               - if set, the order uses permit2
 * 247 bit `UNWRAP_WETH_FLAG`               - if set, the order requires to unwrap WETH
 *
 * Low 200 bits are used for allowed sender, expiration, nonceOrEpoch, and series
 * uint80 last 10 bytes of allowed sender address (0 if any)
 * uint40 expiration timestamp (0 if none)
 * uint40 nonce or epoch
 * uint40 series
 */
export class MakerTraits {
    // Low 200 bits are used for allowed sender, expiration, nonceOrEpoch, and series
    private static ALLOWED_SENDER_MASK = new BitMask(0n, 80n)

    private static EXPIRATION_MASK = new BitMask(80n, 120n)

    private static NONCE_OR_EPOCH_MASK = new BitMask(120n, 160n)

    private static SERIES_MASK = new BitMask(160n, 200n)

    private static NO_PARTIAL_FILLS_FLAG = 255n

    private static ALLOW_MULTIPLE_FILLS_FLAG = 254n

    private static PRE_INTERACTION_CALL_FLAG = 252n

    private static POST_INTERACTION_CALL_FLAG = 251n

    private static NEED_CHECK_EPOCH_MANAGER_FLAG = 250n

    private static HAS_EXTENSION_FLAG = 249n

    private static USE_PERMIT2_FLAG = 248n

    private static UNWRAP_WETH_FLAG = 247n

    private value: BN

    constructor(val: bigint) {
        this.value = new BN(val)
    }

    static default(): MakerTraits {
        return new MakerTraits(0n)
    }

    /**
     * Last 10bytes of address
     */
    public allowedSender(): string {
        return this.value
            .getMask(MakerTraits.ALLOWED_SENDER_MASK)
            .value.toString(16)
            .padStart(20, '0')
    }

    public withAllowedSender(sender: Address): this {
        const lastHalf = add0x(sender.toString().slice(-20))
        this.value = this.value.setMask(
            MakerTraits.ALLOWED_SENDER_MASK,
            BigInt(lastHalf)
        )

        return this
    }

    /**
     * If null is return than order has no expiration
     */
    public expiration(): Date | null {
        const timestampSec = this.value.getMask(MakerTraits.EXPIRATION_MASK)

        if (timestampSec.isZero()) {
            return null
        }

        return new Date(Number(timestampSec.value * 1000n))
    }

    public withExpiration(expiration: Date | null | bigint): this {
        const expirationSec =
            expiration === null
                ? 0
                : expiration instanceof Date
                ? Math.floor(expiration.getTime() / 1000)
                : expiration

        const timestampSec = BigInt(expirationSec)

        this.value = this.value.setMask(
            MakerTraits.EXPIRATION_MASK,
            timestampSec
        )

        return this
    }

    public nonceOrEpoch(): bigint {
        return this.value.getMask(MakerTraits.NONCE_OR_EPOCH_MASK).value
    }

    public withNonce(nonce: bigint): this {
        this.value = this.value.setMask(MakerTraits.NONCE_OR_EPOCH_MASK, nonce)

        return this
    }

    public withEpoch(epoch: bigint): this {
        return this.withNonce(epoch)
    }

    public withSeries(series: bigint): this {
        this.value = this.value.setMask(MakerTraits.SERIES_MASK, series)

        return this
    }

    public series(): bigint {
        return this.value.getMask(MakerTraits.SERIES_MASK).value
    }

    public hasExtension(): boolean {
        return this.value.getBit(MakerTraits.HAS_EXTENSION_FLAG) === 1
    }

    public withExtension(): this {
        this.value = this.value.setBit(MakerTraits.HAS_EXTENSION_FLAG, 1)

        return this
    }

    public isPartialFilledAllowed(): boolean {
        return this.value.getBit(MakerTraits.NO_PARTIAL_FILLS_FLAG) === 0
    }

    public disablePartialFills(): this {
        this.value = this.value.setBit(MakerTraits.NO_PARTIAL_FILLS_FLAG, 1)

        return this
    }

    public allowPartialFills(): this {
        this.value = this.value.setBit(MakerTraits.NO_PARTIAL_FILLS_FLAG, 0)

        return this
    }

    public isMultipleFillsAllowed(): boolean {
        return this.value.getBit(MakerTraits.ALLOW_MULTIPLE_FILLS_FLAG) === 1
    }

    public allowMultipleFills(): this {
        this.value = this.value.setBit(MakerTraits.ALLOW_MULTIPLE_FILLS_FLAG, 1)

        return this
    }

    public disableMultipleFills(): this {
        this.value = this.value.setBit(MakerTraits.ALLOW_MULTIPLE_FILLS_FLAG, 0)

        return this
    }

    public hasPreInteraction(): boolean {
        return this.value.getBit(MakerTraits.PRE_INTERACTION_CALL_FLAG) === 1
    }

    public enablePreInteraction(): this {
        this.value = this.value.setBit(MakerTraits.PRE_INTERACTION_CALL_FLAG, 1)

        return this
    }

    public disablePreInteraction(): this {
        this.value = this.value.setBit(MakerTraits.PRE_INTERACTION_CALL_FLAG, 0)

        return this
    }

    public hasPostInteraction(): boolean {
        return this.value.getBit(MakerTraits.POST_INTERACTION_CALL_FLAG) === 1
    }

    public enablePostInteraction(): this {
        this.value = this.value.setBit(
            MakerTraits.POST_INTERACTION_CALL_FLAG,
            1
        )

        return this
    }

    public disablePostInteraction(): this {
        this.value = this.value.setBit(
            MakerTraits.POST_INTERACTION_CALL_FLAG,
            0
        )

        return this
    }

    public isNeedCheckEpochManager(): boolean {
        return (
            this.value.getBit(MakerTraits.NEED_CHECK_EPOCH_MANAGER_FLAG) === 1
        )
    }

    public enableEpochManagerCheck(): this {
        this.value = this.value.setBit(
            MakerTraits.NEED_CHECK_EPOCH_MANAGER_FLAG,
            1
        )

        return this
    }

    public disableEpochManagerCheck(): this {
        this.value = this.value.setBit(
            MakerTraits.NEED_CHECK_EPOCH_MANAGER_FLAG,
            0
        )

        return this
    }

    public isPermit2(): boolean {
        return this.value.getBit(MakerTraits.USE_PERMIT2_FLAG) === 1
    }

    public enablePermit2(): this {
        this.value = this.value.setBit(MakerTraits.USE_PERMIT2_FLAG, 1)

        return this
    }

    public disablePermit2(): this {
        this.value = this.value.setBit(MakerTraits.USE_PERMIT2_FLAG, 0)

        return this
    }

    public isNativeUnwrapEnabled(): boolean {
        return this.value.getBit(MakerTraits.UNWRAP_WETH_FLAG) === 1
    }

    public enableNativeUnwrap(): this {
        this.value = this.value.setBit(MakerTraits.UNWRAP_WETH_FLAG, 1)

        return this
    }

    public disableNativeUnwrap(): this {
        this.value = this.value.setBit(MakerTraits.UNWRAP_WETH_FLAG, 0)

        return this
    }

    public asBigInt(): bigint {
        return this.value.value
    }
}
