import {isValidAddress} from '../validations'
import {add0x, assert} from '../utils'
import {BN} from '../bn'

const UINT_80_MAX =
    0x00000000000000000000000000000000000000000000ffffffffffffffffffffn
const UINT_40_MAX =
    0x000000000000000000000000000000000000000000000000000000ffffffffffn
/**
 * The MakerTraits type is a uint256 and different parts of the number are used to encode different traits.
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
    private static ALLOWED_SENDER_MASK = UINT_80_MAX

    private static EXPIRATION_OFFSET = 80n

    private static EXPIRATION_MASK = UINT_40_MAX

    private static NONCE_OR_EPOCH_OFFSET = 120n

    private static NONCE_OR_EPOCH_MASK = UINT_40_MAX

    private static SERIES_OFFSET = 160n

    private static SERIES_MASK = UINT_40_MAX

    private static NO_PARTIAL_FILLS_FLAG = 255n

    private static ALLOW_MULTIPLE_FILLS_FLAG = 254n

    private static PRE_INTERACTION_CALL_FLAG = 252n

    private static POST_INTERACTION_CALL_FLAG = 251n

    private static NEED_CHECK_EPOCH_MANAGER_FLAG = 250n

    private static HAS_EXTENSION_FLAG = 249n

    private static USE_PERMIT2_FLAG = 248n

    private static UNWRAP_WETH_FLAG = 247n

    private value: bigint

    constructor(val: bigint) {
        this.value = val
    }

    /**
     * Last 10bytes of address
     */
    public allowedSender(): string {
        return new BN(this.value).and(MakerTraits.ALLOWED_SENDER_MASK).toHex()
    }

    public withAllowedSender(sender: string): this {
        assert(isValidAddress(sender), 'Sender must be valid address')

        const lastHalf = add0x(sender.slice(-20))
        this.value |= BigInt(lastHalf)

        return this
    }

    /**
     * If null is return than order has no expiration
     */
    public expiration(): Date | null {
        const timestampSec = new BN(this.value)
            .shiftRight(MakerTraits.EXPIRATION_OFFSET)
            .and(MakerTraits.EXPIRATION_MASK)

        if (timestampSec.isZero()) {
            return null
        }

        return new Date(Number(timestampSec.value * 1000n))
    }

    public withExpiration(expiration: Date | null): this {
        const timestampSec = BigInt(
            expiration === null ? 0 : Math.floor(expiration.getTime() / 1000)
        )

        assert(timestampSec <= UINT_40_MAX, 'Expiration time too big')

        this.value |= timestampSec << MakerTraits.EXPIRATION_OFFSET

        return this
    }

    public nonceOrEpoch(): bigint {
        return new BN(this.value)
            .shiftRight(MakerTraits.NONCE_OR_EPOCH_OFFSET)
            .and(MakerTraits.NONCE_OR_EPOCH_MASK).value
    }

    public withNonce(nonce: bigint): this {
        assert(nonce <= UINT_40_MAX, 'Nonce too big')

        this.value |= nonce << MakerTraits.NONCE_OR_EPOCH_OFFSET

        return this
    }

    public withEpoch(epoch: bigint): this {
        return this.withNonce(epoch)
    }

    public series(): bigint {
        return new BN(this.value)
            .shiftRight(MakerTraits.SERIES_OFFSET)
            .and(MakerTraits.SERIES_MASK).value
    }

    public hasExtension(): boolean {
        return new BN(this.value).getBit(MakerTraits.HAS_EXTENSION_FLAG) === 1
    }

    public withExtension(): this {
        this.value = new BN(this.value).setBit(
            MakerTraits.HAS_EXTENSION_FLAG,
            1
        ).value

        return this
    }

    public isPartialFilledAllowed(): boolean {
        return (
            new BN(this.value).getBit(MakerTraits.NO_PARTIAL_FILLS_FLAG) === 0
        )
    }

    public disablePartialFills(): this {
        this.value = new BN(this.value).setBit(
            MakerTraits.NO_PARTIAL_FILLS_FLAG,
            1
        ).value

        return this
    }

    public allowPartialFills(): this {
        this.value = new BN(this.value).setBit(
            MakerTraits.NO_PARTIAL_FILLS_FLAG,
            0
        ).value

        return this
    }

    public isMultipleFillsAllowed(): boolean {
        return (
            new BN(this.value).getBit(MakerTraits.ALLOW_MULTIPLE_FILLS_FLAG) ===
            1
        )
    }

    public allowMultipleFills(): this {
        this.value = new BN(this.value).setBit(
            MakerTraits.ALLOW_MULTIPLE_FILLS_FLAG,
            1
        ).value

        return this
    }

    public disableMultipleFills(): this {
        this.value = new BN(this.value).setBit(
            MakerTraits.ALLOW_MULTIPLE_FILLS_FLAG,
            0
        ).value

        return this
    }

    public hasPreInteraction(): boolean {
        return (
            new BN(this.value).getBit(MakerTraits.PRE_INTERACTION_CALL_FLAG) ===
            1
        )
    }

    public enablePreInteraction(): this {
        this.value = new BN(this.value).setBit(
            MakerTraits.PRE_INTERACTION_CALL_FLAG,
            1
        ).value

        return this
    }

    public disablePreInteraction(): this {
        this.value = new BN(this.value).setBit(
            MakerTraits.PRE_INTERACTION_CALL_FLAG,
            0
        ).value

        return this
    }

    public hasPostInteraction(): boolean {
        return (
            new BN(this.value).getBit(
                MakerTraits.POST_INTERACTION_CALL_FLAG
            ) === 1
        )
    }

    public enablePostInteraction(): this {
        this.value = new BN(this.value).setBit(
            MakerTraits.POST_INTERACTION_CALL_FLAG,
            1
        ).value

        return this
    }

    public disablePostInteraction(): this {
        this.value = new BN(this.value).setBit(
            MakerTraits.POST_INTERACTION_CALL_FLAG,
            0
        ).value

        return this
    }

    public needCheckEpochManager(): boolean {
        return (
            new BN(this.value).getBit(
                MakerTraits.NEED_CHECK_EPOCH_MANAGER_FLAG
            ) === 1
        )
    }

    public enableEpochManagerCheck(): this {
        this.value = new BN(this.value).setBit(
            MakerTraits.NEED_CHECK_EPOCH_MANAGER_FLAG,
            1
        ).value

        return this
    }

    public disableEpochManagerCheck(): this {
        this.value = new BN(this.value).setBit(
            MakerTraits.NEED_CHECK_EPOCH_MANAGER_FLAG,
            0
        ).value

        return this
    }

    public isPermit2(): boolean {
        return new BN(this.value).getBit(MakerTraits.USE_PERMIT2_FLAG) === 1
    }

    public enablePermit2(): this {
        this.value = new BN(this.value).setBit(
            MakerTraits.USE_PERMIT2_FLAG,
            1
        ).value

        return this
    }

    public disablePermit2(): this {
        this.value = new BN(this.value).setBit(
            MakerTraits.USE_PERMIT2_FLAG,
            0
        ).value

        return this
    }

    public isNativeUnwrapEnabled(): boolean {
        return new BN(this.value).getBit(MakerTraits.UNWRAP_WETH_FLAG) === 1
    }

    public enableNativeUnwrap(): this {
        this.value = new BN(this.value).setBit(
            MakerTraits.UNWRAP_WETH_FLAG,
            1
        ).value

        return this
    }

    public disableNativeUnwrap(): this {
        this.value = new BN(this.value).setBit(
            MakerTraits.UNWRAP_WETH_FLAG,
            0
        ).value

        return this
    }

    public asBigInt(): bigint {
        return this.value
    }
}
