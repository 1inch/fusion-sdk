import {Address} from '../address'
import {Extension} from './extension'
import {BN} from '../utils/bytes/bn'
import {BitMask} from '../utils/bytes/bit-mask'
import {getBytesCount, trim0x} from '../utils'
import {Interaction} from './interaction'

export enum AmountMode {
    /**
     * Amount provided to fill function treated as `takingAmount` and `makingAmount` calculated based on it
     */
    taker,

    /**
     * Amount provided to fill function treated as `makingAmount` and `takingAmount` calculated based on it
     */
    maker
}

/**
 * TakerTraitsLib
 * This class defines TakerTraits, which are used to encode the taker's preferences for an order in a single uint256.
 *
 * The TakerTraits are structured as follows:
 * High bits are used for flags
 * 255 bit `_MAKER_AMOUNT_FLAG`           - If set, the taking amount is calculated based on making amount, otherwise making amount is calculated based on taking amount.
 * 254 bit `_UNWRAP_WETH_FLAG`            - If set, the WETH will be unwrapped into ETH before sending to taker.
 * 253 bit `_SKIP_ORDER_PERMIT_FLAG`      - If set, the order skips maker's permit execution.
 * 252 bit `_USE_PERMIT2_FLAG`            - If set, the order uses the permit2 function for authorization.
 * 251 bit `_ARGS_HAS_TARGET`             - If set, then first 20 bytes of args are treated as receiver address for maker’s funds transfer.
 * 224-247 bits `ARGS_EXTENSION_LENGTH`   - The length of the extension calldata in the args.
 * 200-223 bits `ARGS_INTERACTION_LENGTH` - The length of the interaction calldata in the args.
 * 0-184 bits                             - The threshold amount (the maximum amount a taker agrees to give in exchange for a making amount).
 */
export class TakerTraits {
    private static MAKER_AMOUNT_FLAG = 255n

    private static UNWRAP_WETH_FLAG = 254n

    private static SKIP_ORDER_PERMIT_FLAG = 253n

    private static USE_PERMIT2_FLAG = 252n

    private static ARGS_HAS_RECEIVER = 251n

    private static THRESHOLD_MASK = new BitMask(0n, 185n)

    private static ARGS_INTERACTION_LENGTH_MASK = new BitMask(200n, 224n)

    private static ARGS_EXTENSION_LENGTH_MASK = new BitMask(224n, 248n)

    private flags: BN

    private receiver?: Address

    private extension?: Extension

    private interaction?: Interaction

    constructor(
        flag: bigint,
        data: {
            receiver?: Address
            extension?: Extension
            interaction?: Interaction
        }
    ) {
        this.flags = new BN(flag)
        this.receiver = data.receiver
        this.extension = data.extension

        this.interaction = data.interaction
    }

    static default(): TakerTraits {
        return new TakerTraits(0n, {})
    }

    /**
     * Returns enabled amount mode, it defines how to treat passed amount in `fillContractOrderArgs` function
     *
     * @see AmountMode
     */
    public getAmountMode(): AmountMode {
        return this.flags.getBit(TakerTraits.MAKER_AMOUNT_FLAG)
    }

    public setAmountMode(mode: AmountMode): this {
        this.flags = this.flags.setBit(TakerTraits.MAKER_AMOUNT_FLAG, mode)

        return this
    }

    /**
     * Is the Wrapped native currency will be unwrapped into Native currency before sending to taker
     */
    public isNativeUnwrapEnabled(): boolean {
        return this.flags.getBit(TakerTraits.UNWRAP_WETH_FLAG) === 1
    }

    /**
     * Wrapped native currency will be unwrapped into Native currency before sending to taker
     */
    public enableNativeUnwrap(): this {
        this.flags = this.flags.setBit(TakerTraits.UNWRAP_WETH_FLAG, 1)

        return this
    }

    /**
     * Wrapped native currency will NOT be unwrapped into Native currency before sending to taker
     */
    public disableNativeUnwrap(): this {
        this.flags = this.flags.setBit(TakerTraits.UNWRAP_WETH_FLAG, 0)

        return this
    }

    /**
     * If true, then maker's permit execution is skipped
     */
    public isOrderPermitSkipped(): boolean {
        return Boolean(this.flags.getBit(TakerTraits.SKIP_ORDER_PERMIT_FLAG))
    }

    /**
     * The order skips maker's permit execution
     */
    public skipOrderPermit(): this {
        this.flags = this.flags.setBit(TakerTraits.SKIP_ORDER_PERMIT_FLAG, 1)

        return this
    }

    /**
     * Should use permit2 function for authorization or not
     *
     * @see https://github.com/Uniswap/permit2
     */
    public isPermit2Enabled(): boolean {
        return this.flags.getBit(TakerTraits.USE_PERMIT2_FLAG) === 1
    }

    /**
     * Use permit2 function for authorization
     *
     * @see https://github.com/Uniswap/permit2
     */
    public enablePermit2(): this {
        this.flags = this.flags.setBit(TakerTraits.USE_PERMIT2_FLAG, 1)

        return this
    }

    /**
     * NOT use permit2 function for authorization
     */
    public disablePermit2(): this {
        this.flags = this.flags.setBit(TakerTraits.USE_PERMIT2_FLAG, 0)

        return this
    }

    /**
     * Sets address where order filled to, `msg.sender` used if not set
     *
     * @param receiver
     */
    public setReceiver(receiver: Address): this {
        this.receiver = receiver

        return this
    }

    /**
     * Set order receiver as `msg.sender`
     */
    public removeReceiver(): this {
        this.receiver = undefined

        return this
    }

    /**
     * Sets extension, it is required to provide same extension as in order creation (if any)
     */
    public setExtension(ext: Extension): this {
        this.extension = ext

        return this
    }

    public removeExtension(): this {
        this.extension = undefined

        return this
    }

    /**
     * Set threshold amount
     *
     * In taker amount mode: the minimum amount a taker agrees to receive in exchange for a taking amount.
     * In maker amount mode: the maximum amount a taker agrees to give in exchange for a making amount.
     *
     * @see AmountMode
     */
    public setAmountThreshold(threshold: bigint): this {
        this.flags = this.flags.setMask(TakerTraits.THRESHOLD_MASK, threshold)

        return this
    }

    /**
     * @see setAmountThreshold
     */
    public removeAmountThreshold(): this {
        this.flags = this.flags.setMask(TakerTraits.THRESHOLD_MASK, 0n)

        return this
    }

    /**
     * Sets taker interaction
     *
     * `interaction.target` should implement `ITakerInteraction` interface
     *
     * @see https://github.com/1inch/limit-order-protocol/blob/1a32e059f78ddcf1fe6294baed6cafb73a04b685/contracts/interfaces/ITakerInteraction.sol#L11
     */
    public setInteraction(interaction: Interaction): this {
        this.interaction = interaction

        return this
    }

    public removeInteraction(): this {
        this.interaction = undefined

        return this
    }

    public encode(): {trait: bigint; args: string} {
        const extensionLen = this.extension
            ? getBytesCount(this.extension.encode())
            : 0n

        const interactionLen = this.interaction
            ? getBytesCount(this.interaction.encode())
            : 0n

        const flags = this.flags
            .setBit(TakerTraits.ARGS_HAS_RECEIVER, this.receiver ? 1 : 0)
            .setMask(TakerTraits.ARGS_EXTENSION_LENGTH_MASK, extensionLen)
            .setMask(TakerTraits.ARGS_INTERACTION_LENGTH_MASK, interactionLen)

        const args =
            (this.receiver?.toString() || '0x') +
            trim0x(this.extension?.encode() || '') +
            trim0x(this.interaction?.encode() || '')

        return {
            trait: flags.value,
            args
        }
    }
}
