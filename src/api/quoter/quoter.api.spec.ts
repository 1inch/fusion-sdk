import {QuoterApi} from './quoter.api'
import {QuoteRequest} from './quote.request'
import {HttpProviderConnector} from '../../connector'
import {QuoterResponseMock} from './quote.mock'

describe('Quoter API', () => {
    const httpProvider: HttpProviderConnector = {
        get: jest.fn().mockImplementationOnce(() => {
            return Promise.resolve(QuoterResponseMock)
        }),
        post: jest.fn().mockImplementation(() => {
            return Promise.resolve(null)
        })
    }

    it('should get quote with disabled estimate', async () => {
        const quoter = QuoterApi.new(
            {
                url: 'https://test.com/quoter',
                network: 1
            },
            httpProvider
        )

        const params = QuoteRequest.new({
            fromTokenAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
            toTokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            amount: '1000000000000000000000',
            walletAddress: '0x00000000219ab540356cbb839cbe05303d7705fa'
        })

        const res = await quoter.getQuote(params)
        expect(res).toStrictEqual(QuoterResponseMock)
        expect(httpProvider.get).toHaveBeenCalledWith(
            'https://test.com/quoter/v1.0/1/quote/receive/?fromTokenAddress=0x6b175474e89094c44da98b954eedeac495271d0f&toTokenAddress=0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2&amount=1000000000000000000000&walletAddress=0x00000000219ab540356cbb839cbe05303d7705fa'
        )
    })
})
