import {Address} from '@1inch/limit-order-sdk'

export type AuctionWhitelistItem = {
    address: Address
    /**
     * Timestamp in sec at which address can start resolving
     */
    allowFrom: bigint
}

export type SettlementSuffixData = {
    whitelist: AuctionWhitelistItem[]
    integratorFee?: IntegratorFee
    bankFee?: bigint
    resolvingStartTime: bigint
}

export type IntegratorFee = {
    /**
     * In pbs multiplied by precision
     *
     * @see bpsToRatioFormat
     */
    ratio: bigint
    receiver: Address
}
