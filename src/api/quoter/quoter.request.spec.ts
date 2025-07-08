import {Address, Bps} from '@1inch/limit-order-sdk'
import {QuoterRequest} from './quoter.request.js'

describe(__filename, () => {
    it('should return error if native currency', () => {
        expect(() =>
            QuoterRequest.new({
                fromTokenAddress: Address.NATIVE_CURRENCY.toString(),
                toTokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                amount: '1000000000000000000000',
                walletAddress: '0x00000000219ab540356cbb839cbe05303d7705fa',
                integratorFee: {
                    share: Bps.fromPercent(50),
                    receiver: Address.fromBigInt(10n),
                    value: new Bps(1n)
                }
            })
        ).toThrow(/wrap native currency/)
    })

    it('returns error fromTokenAddress or toTokenAddress equals ZERO_ADDRESS', () => {
        expect(() =>
            QuoterRequest.new({
                fromTokenAddress: Address.ZERO_ADDRESS.toString(),
                toTokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                amount: '1000000000000000000000',
                walletAddress: '0x00000000219ab540356cbb839cbe05303d7705fa',
                integratorFee: {
                    share: Bps.fromPercent(50),
                    receiver: Address.fromBigInt(10n),
                    value: new Bps(1n)
                }
            })
        ).toThrow(/replace/)
        expect(() =>
            QuoterRequest.new({
                fromTokenAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
                toTokenAddress: Address.ZERO_ADDRESS.toString(),
                amount: '1000000000000000000000',
                walletAddress: '0x00000000219ab540356cbb839cbe05303d7705fa',
                integratorFee: {
                    share: Bps.fromPercent(50),
                    receiver: Address.fromBigInt(10n),
                    value: new Bps(1n)
                }
            })
        ).toThrow(/replace/)
    })

    it('returns error fromTokenAddress equals toTokenAddress', () => {
        expect(() =>
            QuoterRequest.new({
                fromTokenAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
                toTokenAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
                amount: '1000000000000000000000',
                walletAddress: '0x00000000219ab540356cbb839cbe05303d7705fa',
                integratorFee: {
                    share: Bps.fromPercent(50),
                    receiver: Address.fromBigInt(10n),
                    value: new Bps(1n)
                }
            })
        ).toThrow(/fromTokenAddress and toTokenAddress should be different/)
    })

    it('returns error if walletAddress invalid', () => {
        expect(() =>
            QuoterRequest.new({
                fromTokenAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
                toTokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                amount: '1000000000000000000000',
                walletAddress: '0x0000000019ab540356cbb839be05303d7705fa1',
                integratorFee: {
                    share: Bps.fromPercent(50),
                    receiver: Address.fromBigInt(10n),
                    value: new Bps(1n)
                }
            })
        ).toThrow(/Invalid address/)
    })

    it('returns error if amount is invalid', () => {
        expect(() =>
            QuoterRequest.new({
                fromTokenAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
                toTokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                amount: 'dasdad',
                walletAddress: '0x00000000219ab540356cbb839cbe05303d7705fa',
                integratorFee: {
                    share: Bps.fromPercent(50),
                    receiver: Address.fromBigInt(10n),
                    value: new Bps(1n)
                }
            })
        ).toThrow(/is invalid amount/)
    })

    it('returns error if  fee is provided and source not', () => {
        expect(() =>
            QuoterRequest.new({
                fromTokenAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
                toTokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                amount: '1000000',
                walletAddress: '0x00000000219ab540356cbb839cbe05303d7705fa',
                integratorFee: {
                    share: Bps.fromPercent(50),
                    receiver: Address.fromBigInt(10n),
                    value: new Bps(1n)
                }
            })
        ).toThrow(/cannot use fee without source/)
    })
})
