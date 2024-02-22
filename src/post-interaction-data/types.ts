import {Address} from '../address'

export type AuctionWhitelistItem = {
    address: Address
    /**
     * Delay from auction start in seconds
     */
    allowance: number
}

export type SettlementSuffixData = {
    whitelist: AuctionWhitelistItem[]
    integratorFee?: IntegratorFee
    bankFee: bigint
    auctionStartTime: bigint
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
