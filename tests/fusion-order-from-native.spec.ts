import {parseEther, parseUnits} from 'ethers'
import {ProxyFactory, NativeOrdersFactory} from '@1inch/limit-order-sdk'

import {ReadyEvmFork, setupEvm} from './setup-chain.js'
import {USDC, WETH, ONE_INCH_LIMIT_ORDER_V4} from './addresses.js'
import {TestWallet} from './test-wallet.js'
import {now} from './utils.js'

import {
    Address,
    AmountMode,
    AuctionDetails,
    FusionOrder,
    LimitOrderContract,
    NetworkEnum,
    SurplusParams,
    TakerTraits,
    Whitelist
} from '../src/index.js'

jest.setTimeout(100_000)

describe('NativeOrders', () => {
    let maker: TestWallet
    let taker: TestWallet
    let EXT_ADDRESS: string
    let NATIVE_ORDERS_FACTORY: string
    let NATIVE_ORDERS_IMPL: string
    let testNode: ReadyEvmFork

    let protocol: TestWallet
    beforeAll(async () => {
        testNode = await setupEvm()
        maker = testNode.maker
        taker = testNode.taker
        EXT_ADDRESS = testNode.addresses.settlement
        NATIVE_ORDERS_FACTORY = testNode.addresses.nativeOrdersFactory
        NATIVE_ORDERS_IMPL = testNode.addresses.nativeOrdersImpl

        protocol = await TestWallet.fromAddress(
            Address.fromBigInt(256n),
            testNode.provider
        )
    })

    afterAll(async () => {
        testNode.provider.destroy()
        await testNode.localNode.stop()
    })

    it('should execute order without fees and auction', async () => {
        const initBalances = {
            usdc: {
                maker: await maker.tokenBalance(USDC),
                taker: await taker.tokenBalance(USDC),
                protocol: await protocol.tokenBalance(USDC)
            },
            weth: {
                maker: await maker.tokenBalance(WETH),
                taker: await taker.tokenBalance(WETH),
                protocol: await protocol.tokenBalance(WETH)
            },
            eth: {
                maker: await maker.nativeBalance(),
                taker: await taker.nativeBalance(),
                protocol: await protocol.nativeBalance()
            }
        }

        const takerAddress = new Address(await taker.getAddress())

        const makerAddr = new Address(await maker.getAddress())
        const order = FusionOrder.fromNative(
            NetworkEnum.ETHEREUM,
            new ProxyFactory(
                new Address(NATIVE_ORDERS_FACTORY),
                new Address(NATIVE_ORDERS_IMPL)
            ),
            new Address(EXT_ADDRESS),
            {
                maker: makerAddr,
                takerAsset: new Address(USDC),
                makingAmount: parseEther('0.1'),
                takingAmount: parseUnits('100', 6)
            },
            {
                auction: new AuctionDetails({
                    duration: 120n,
                    startTime: now(),
                    points: [],
                    initialRateBump: 0
                }),
                whitelist: Whitelist.new(0n, [
                    {address: takerAddress, allowFrom: 0n}
                ]),
                surplus: SurplusParams.NO_FEE
            }
        )

        const nativeOrderFactory = new Address(NATIVE_ORDERS_FACTORY)
        const orderData = order.build()

        const signature = order.nativeSignature(makerAddr)

        const factory = new NativeOrdersFactory(nativeOrderFactory)

        const createTx = factory.create(makerAddr, orderData)

        const createTxResult = await maker.send({
            to: createTx.to.toString(),
            data: createTx.data.toString(),
            value: createTx.value
        })

        const createTxReceipt = await testNode.provider.getTransactionReceipt(
            createTxResult.txHash
        )
        const createTxGasCost =
            createTxReceipt!.gasUsed * createTxReceipt!.gasPrice

        const data = LimitOrderContract.getFillContractOrderArgsCalldata(
            orderData,
            signature,
            TakerTraits.default()
                .setExtension(order.extension)
                .setAmountMode(AmountMode.maker),
            order.makingAmount
        )

        await taker.send({
            data,
            to: ONE_INCH_LIMIT_ORDER_V4
        })

        const finalBalances = {
            usdc: {
                maker: await maker.tokenBalance(USDC),
                taker: await taker.tokenBalance(USDC),
                protocol: await protocol.tokenBalance(USDC)
            },
            weth: {
                maker: await maker.tokenBalance(WETH),
                taker: await taker.tokenBalance(WETH),
                protocol: await protocol.tokenBalance(WETH)
            },
            eth: {
                maker: await maker.nativeBalance(),
                taker: await taker.nativeBalance(),
                protocol: await protocol.nativeBalance()
            }
        }

        expect(initBalances.eth.maker - finalBalances.eth.maker).toBe(
            order.makingAmount + createTxGasCost
        )
        expect(finalBalances.usdc.maker - initBalances.usdc.maker).toBe(
            order.takingAmount
        )

        expect(finalBalances.weth.taker - initBalances.weth.taker).toBe(
            order.makingAmount
        )
        expect(initBalances.usdc.taker - finalBalances.usdc.taker).toBe(
            order.calcTakingAmount(takerAddress, order.makingAmount, now())
        )
    })
})
