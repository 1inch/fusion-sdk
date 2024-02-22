import {trim0x} from '../utils'
import assert from 'assert'
import {isHexString} from '../validations'
import {Address} from '../address'
import {Extension} from './extension'
import {IExtensionBuilder} from './types'
import {ZX} from '../constants'
import {Interaction} from './interaction'

export class ExtensionBuilder implements IExtensionBuilder {
    private makerAssetSuffix = ZX

    private takerAssetSuffix = ZX

    private makingAmountData = ZX

    private takingAmountData = ZX

    private predicate = ZX

    private makerPermit = ZX

    private preInteraction = ZX

    private postInteraction = ZX

    private customData = ZX

    public withMakerAssetSuffix(suffix: string): this {
        assert(isHexString(suffix), 'MakerAssetSuffix must be valid hex string')

        this.makerAssetSuffix = suffix

        return this
    }

    public withTakerAssetSuffix(suffix: string): this {
        assert(isHexString(suffix), 'TakerAssetSuffix must be valid hex string')

        this.takerAssetSuffix = suffix

        return this
    }

    /**
     *
     * @param address Address of contract which will be called with `data` to calculate making amount
     * @param data
     */
    public withMakingAmountData(address: Address, data: string): this {
        assert(isHexString(data), 'MakingAmountData must be valid hex string')

        this.makingAmountData = address.toString() + trim0x(data)

        return this
    }

    /**
     *
     * @param address Address of contract which will be called with `data` to calculate taking amount
     * @param data
     */
    public withTakingAmountData(address: Address, data: string): this {
        assert(isHexString(data), 'TakingAmountData must be valid hex string')

        this.takingAmountData = address.toString() + trim0x(data)

        return this
    }

    public withPredicate(predicate: string): this {
        assert(isHexString(predicate), 'Predicate must be valid hex string')
        this.predicate = predicate

        return this
    }

    public withMakerPermit(tokenFrom: Address, permitData: string): this {
        assert(isHexString(permitData), 'Permit data must be valid hex string')

        this.makerPermit = tokenFrom.toString() + trim0x(permitData)

        return this
    }

    public withPreInteraction(interaction: Interaction): this {
        this.preInteraction = interaction.encode()

        return this
    }

    public withPostInteraction(interaction: Interaction): this {
        this.postInteraction = interaction.encode()

        return this
    }

    public withCustomData(data: string): this {
        assert(isHexString(data), 'Custom data must be valid hex string')
        this.customData = trim0x(data)

        return this
    }

    public build(): Extension {
        return new Extension({
            makerAssetSuffix: this.makerAssetSuffix,
            takerAssetSuffix: this.takerAssetSuffix,
            makingAmountData: this.makingAmountData,
            takingAmountData: this.takingAmountData,
            predicate: this.predicate,
            makerPermit: this.makerPermit,
            preInteraction: this.preInteraction,
            postInteraction: this.postInteraction,
            customData: this.customData
        })
    }
}
