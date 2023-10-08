import {NATIVE_CURRENCY, ZERO_ADDRESS} from '../../constants'
import {QuoterRequest} from './quoter.request'

describe(__filename, () => {
    it('should return error if native currency', () => {
        const params = QuoterRequest.new({
            fromTokenAddress: NATIVE_CURRENCY,
            toTokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            amount: '1000000000000000000000',
            walletAddress: '0x00000000219ab540356cbb839cbe05303d7705fa',
            fee: 1
        })

        const error = params.validate()

        expect(error).toMatch(/wrap native currency/)
    })

    it('returns error fromTokenAddress or toTokenAddress equals ZERO_ADDRESS', () => {
        const params1 = QuoterRequest.new({
            fromTokenAddress: ZERO_ADDRESS,
            toTokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            amount: '1000000000000000000000',
            walletAddress: '0x00000000219ab540356cbb839cbe05303d7705fa',
            fee: 1
        })

        const params2 = QuoterRequest.new({
            fromTokenAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
            toTokenAddress: ZERO_ADDRESS,
            amount: '1000000000000000000000',
            walletAddress: '0x00000000219ab540356cbb839cbe05303d7705fa',
            fee: 1
        })

        const error1 = params1.validate()
        const error2 = params2.validate()

        expect(error1).toMatch(/replace/)
        expect(error2).toMatch(/replace/)
    })

    it('returns error fromTokenAddress equals toTokenAddress', () => {
        const params = QuoterRequest.new({
            fromTokenAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
            toTokenAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
            amount: '1000000000000000000000',
            walletAddress: '0x00000000219ab540356cbb839cbe05303d7705fa',
            fee: 1
        })

        const error = params.validate()

        expect(error).toMatch(
            /fromTokenAddress and toTokenAddress should be different/
        )
    })

    it('returns error if fromTokenAddress invalid', () => {
        const params = QuoterRequest.new({
            fromTokenAddress: '0x6b175474e89094c4da98b954eedeac495271d0f',
            toTokenAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
            amount: '1000000000000000000000',
            walletAddress: '0x00000000219ab540356cbb839cbe05303d7705fa',
            fee: 1
        })

        const error = params.validate()

        expect(error).toMatch(/is invalid fromTokenAddress/)
    })

    it('returns error if toTokenAddress invalid', () => {
        const params = QuoterRequest.new({
            fromTokenAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
            toTokenAddress: '0x6b175474e8909c44da98b954eedeac495271d0f',
            amount: '1000000000000000000000',
            walletAddress: '0x00000000219ab540356cbb839cbe05303d7705fa',
            fee: 1
        })

        const error = params.validate()

        expect(error).toMatch(/is invalid toTokenAddress/)
    })

    it('returns error if walletAddress invalid', () => {
        const params = QuoterRequest.new({
            fromTokenAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
            toTokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            amount: '1000000000000000000000',
            walletAddress: '0x0000000019ab540356cbb839cbe05303d7705fa',
            fee: 1
        })

        const error = params.validate()

        expect(error).toMatch(/is invalid walletAddress/)
    })

    it('returns error if amount is invalid', () => {
        const params = QuoterRequest.new({
            fromTokenAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
            toTokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            amount: 'dasdad',
            walletAddress: '0x00000000219ab540356cbb839cbe05303d7705fa',
            fee: 1
        })

        const error = params.validate()

        expect(error).toMatch(/is invalid amount/)
    })

    it('returns error if  fee is provided and source not', () => {
        const params = QuoterRequest.new({
            fromTokenAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
            toTokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            amount: '1000000',
            walletAddress: '0x00000000219ab540356cbb839cbe05303d7705fa',
            fee: 1
        })

        const error = params.validate()

        expect(error).toMatch(/cannot use fee without source/)
    })
})
