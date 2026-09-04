import {Address} from '@1inch/limit-order-sdk'
import {Quote} from './quote'
import {QuoterRequest} from '../quoter.request'
import {PresetEnum, QuoterResponse} from '../types'
import {FusionOrder} from '../../../fusion-order'
import {NetworkEnum} from '../../../constants'
import {bpsToRatioFormat} from '../../../sdk'

describe('Quote.createFusionOrder', () => {
    const ResponseMock = {
        fromTokenAmount: '1000000000000000000000',
        recommended_preset: PresetEnum.medium,
        autoK: 5.5,
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
                ],
                allowPartialFills: true,
                allowMultipleFills: true,
                exclusiveResolver: null,
                gasCost: {
                    gasBumpEstimate: 0,
                    gasPriceEstimate: '0'
                }
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
                ],
                allowPartialFills: true,
                allowMultipleFills: true,
                exclusiveResolver: null,
                gasCost: {
                    gasBumpEstimate: 0,
                    gasPriceEstimate: '0'
                }
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
                ],
                allowPartialFills: true,
                allowMultipleFills: true,
                exclusiveResolver: null,
                gasCost: {
                    gasBumpEstimate: 0,
                    gasPriceEstimate: '0'
                }
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
        ],
        bankFee: 0
    } as QuoterResponse

    // Regression test: the native-order backport (#153) moved `fees` from the
    // `details` arg of FusionOrder.new into `extra`, where it is never read,
    // silently dropping the integrator fee from the settlement post-interaction
    it('should keep integrator fee in settlement post-interaction data', () => {
        const feeBps = 100 // 1%
        const feeReceiver = '0x9151def9bec4e77dff32bbf3af5d20b06895b16d'

        const params = QuoterRequest.new({
            fromTokenAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
            toTokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            amount: '1000000000000000000000',
            walletAddress: '0x00000000219ab540356cbb839cbe05303d7705fa',
            fee: feeBps,
            source: '0x6b175474e89094c44da98b954eedeac495271d0f'
        })

        const quote = new Quote(params, ResponseMock)

        const order = quote.createFusionOrder({
            network: NetworkEnum.ETHEREUM,
            takingFeeReceiver: feeReceiver
        })

        expect(order.fusionExtension.postInteractionData.integratorFee).toEqual(
            {
                ratio: bpsToRatioFormat(feeBps),
                receiver: new Address(feeReceiver)
            }
        )
        // orders with an integrator fee route funds through the settlement contract
        expect(order.receiver).toEqual(
            new Address(ResponseMock.settlementAddress)
        )

        // the fee survives the extension encode/decode round-trip
        const decoded = FusionOrder.fromDataAndExtension(
            order.build(),
            order.extension
        )
        expect(
            decoded.fusionExtension.postInteractionData.integratorFee
        ).toEqual({
            ratio: bpsToRatioFormat(feeBps),
            receiver: new Address(feeReceiver)
        })
    })
})
