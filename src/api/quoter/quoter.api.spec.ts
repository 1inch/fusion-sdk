import {QuoterApi} from './quoter.api'
import {QuoterRequest} from './quoter.request'
import {HttpProviderConnector} from '../../connector'
import {Quote} from './quote'
import {PresetEnum} from './types'

describe('Quoter API', () => {
    const params = QuoterRequest.new({
        fromTokenAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
        toTokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        amount: '1000000000000000000000',
        walletAddress: '0x00000000219ab540356cbb839cbe05303d7705fa'
    })

    const ResponseMock = {
        fromTokenAmount: '1000000000000000000000',
        recommended_preset: PresetEnum.medium,
        feeToken: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        presets: {
            fast: {
                auctionDuration: 180,
                startAuctionIn: 36,
                bankFee: '0',
                initialRateBump: 200461,
                auctionStartAmount: '626771998563995046',
                auctionEndAmount: '614454580595911348',
                tokenFee: '9183588477842300',
                points: [
                    {
                        delay: 24,
                        coefficient: 50461
                    }
                ]
            },
            medium: {
                auctionDuration: 180,
                startAuctionIn: 12,
                bankFee: '0',
                initialRateBump: 210661,
                auctionStartAmount: '627398742236202876',
                auctionEndAmount: '614454580595911348',
                tokenFee: '9183588477842300',
                points: [
                    {
                        delay: 24,
                        coefficient: 50461
                    }
                ]
            },
            slow: {
                auctionDuration: 600,
                startAuctionIn: 12,
                bankFee: '0',
                initialRateBump: 302466,
                auctionStartAmount: '633039742513363640',
                auctionEndAmount: '614454580595911348',
                tokenFee: '9183588477842300',
                points: [
                    {
                        delay: 24,
                        coefficient: 50461
                    }
                ]
            }
        },
        toTokenAmount: '626772029219852913',
        prices: {
            usd: {
                fromToken: '0.99326233048693179928',
                toToken: '1618.25668999999970765202'
            }
        },
        volume: {
            usd: {
                fromToken: '993.26233048693179928',
                toToken: '1014.278029389902274042'
            }
        },
        quoteId: null,
        settlementAddress: '0xa88800cd213da5ae406ce248380802bd53b47647',
        whitelist: [
            '0x84d99aa569d93a9ca187d83734c8c4a519c4e9b1',
            '0xcfa62f77920d6383be12c91c71bd403599e1116f'
        ]
    }

    const QuoterResponseMock = new Quote(1, params, ResponseMock)

    const httpProvider: HttpProviderConnector = {
        get: jest.fn().mockImplementationOnce(() => {
            return Promise.resolve(ResponseMock)
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

        const res = await quoter.getQuote(params)

        expect(res).toStrictEqual(QuoterResponseMock)
        expect(httpProvider.get).toHaveBeenCalledWith(
            'https://test.com/quoter/v1.0/1/quote/receive/?fromTokenAddress=0x6b175474e89094c44da98b954eedeac495271d0f&toTokenAddress=0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2&amount=1000000000000000000000&walletAddress=0x00000000219ab540356cbb839cbe05303d7705fa'
        )
    })
})
