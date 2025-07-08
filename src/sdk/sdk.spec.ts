import {instance, mock} from 'ts-mockito'
import {FusionSDK} from './sdk.js'
import {
    HttpProviderConnector,
    Web3Like,
    Web3ProviderConnector
} from '../connector/index.js'
import {NetworkEnum} from '../constants.js'

function createHttpProviderFake<T>(mock: T): HttpProviderConnector {
    const httpProvider: HttpProviderConnector = {
        get: jest.fn().mockImplementationOnce(() => {
            return Promise.resolve(mock)
        }),
        post: jest.fn().mockImplementation(() => {
            return Promise.resolve(null)
        })
    }

    return httpProvider
}

describe(__filename, () => {
    let web3Provider: Web3Like
    let web3ProviderConnector: Web3ProviderConnector

    beforeEach(() => {
        web3Provider = mock<Web3Like>()
        web3ProviderConnector = new Web3ProviderConnector(
            instance(web3Provider)
        )
    })

    it('returns encoded call data to cancel order', async () => {
        const url = 'https://test.com'

        const expected = {
            order: {
                salt: '45144194282371711345892930501725766861375817078109214409479816083205610767025',
                maker: '0x6f250c769001617aff9bdf4b9fd878062e94af83',
                receiver: '0x0000000000000000000000000000000000000000',
                makerAsset: '0x6eb15148d0ea88433dd8088a3acc515d27e36c1b',
                takerAsset: '0xdac17f958d2ee523a2206206994597c13d831ec7',
                makingAmount: '2246481050155000',
                takingAmount: '349837736598',
                makerTraits: '0'
            },
            cancelTx: null,
            points: null,
            auctionStartDate: 1674491231,
            auctionDuration: 180,
            initialRateBump: 50484,
            status: 'filled',
            createdAt: '2023-01-23T16:26:38.803Z',
            fromTokenToUsdPrice: '0.01546652159249409068',
            toTokenToUsdPrice: '1.00135361305236370022',
            fills: [
                {
                    txHash: '0xcdd81e6860fc038d4fe8549efdf18488154667a2088d471cdaa7d492f24178a1',
                    filledMakerAmount: '2246481050155001',
                    filledAuctionTakerAmount: '351593117428'
                }
            ],
            isNativeCurrency: false
        }

        const httpProvider = createHttpProviderFake(expected)
        const sdk = new FusionSDK({
            url,
            network: NetworkEnum.ETHEREUM,
            httpProvider,
            blockchainProvider: web3ProviderConnector
        })

        const orderHash = `0x1beee023ab933cf5446c298eadadb61c05705f2156ef5b2db36c160b36f31ce4`
        const callData = await sdk.buildCancelOrderCallData(orderHash)
        expect(callData).toBe(
            '0xb68fb02000000000000000000000000000000000000000000000000000000000000000001beee023ab933cf5446c298eadadb61c05705f2156ef5b2db36c160b36f31ce4'
        )
    })

    it('throws an exception if order is not get from api', async () => {
        const url = 'https://test.com'

        const expected = undefined
        const httpProvider = createHttpProviderFake(expected)
        const sdk = new FusionSDK({
            url,
            network: NetworkEnum.ETHEREUM,
            httpProvider,
            blockchainProvider: web3ProviderConnector
        })

        const orderHash = `0x1beee023ab933cf5446c298eadadb61c05705f2156ef5b2db36c160b36f31ce4`
        const promise = sdk.buildCancelOrderCallData(orderHash)
        await expect(promise).rejects.toThrow(
            'Can not get order with the specified orderHash 0x1beee023ab933cf5446c298eadadb61c05705f2156ef5b2db36c160b36f31ce4'
        )
    })
})
