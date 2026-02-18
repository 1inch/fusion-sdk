import {parseEther, parseUnits} from 'ethers'
import {Bps} from '@1inch/limit-order-sdk'
import assert from 'assert'

import {ReadyEvmFork, setupEvm} from './setup-chain.js'
import {USDC, WETH, ONE_INCH_LIMIT_ORDER_V4} from './addresses.js'
import {TestWallet} from './test-wallet.js'
import {now} from './utils.js'

import {Fees} from '../src/fusion-order/fees/fees.js'
import {IntegratorFee} from '../src/fusion-order/fees/integrator-fee.js'
import {ResolverFee} from '../src/fusion-order/fees/resolver-fee.js'
import {
    Address,
    AmountMode,
    AuctionCalculator,
    AuctionDetails,
    FusionOrder,
    LimitOrderContract,
    SurplusParams,
    TakerTraits,
    Whitelist
} from '../src/index.js'

jest.setTimeout(100_000)

// eslint-disable-next-line max-lines-per-function
describe('SettlementExtension', () => {
    let maker: TestWallet
    let taker: TestWallet
    let EXT_ADDRESS: string
    let testNode: ReadyEvmFork

    let protocol: TestWallet
    beforeAll(async () => {
        testNode = await setupEvm()
        maker = testNode.maker
        taker = testNode.taker
        EXT_ADDRESS = testNode.addresses.settlement

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
            }
        }

        const takerAddress = new Address(await taker.getAddress())

        const order = FusionOrder.new(
            new Address(EXT_ADDRESS),
            {
                maker: new Address(await maker.getAddress()),
                makerAsset: new Address(WETH),
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

        const signature = await maker.signTypedData(order.getTypedData(1))

        const data = LimitOrderContract.getFillOrderArgsCalldata(
            order.build(),
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
            }
        }

        expect(initBalances.weth.maker - finalBalances.weth.maker).toBe(
            order.makingAmount
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

    // eslint-disable-next-line max-lines-per-function
    describe('Fees', () => {
        it('only integrator fee', async () => {
            const integratorAddress = Address.fromBigInt(1337n)
            const integrator = await TestWallet.fromAddress(
                integratorAddress,
                testNode.provider
            )
            const initBalances = {
                usdc: {
                    maker: await maker.tokenBalance(USDC),
                    taker: await taker.tokenBalance(USDC),
                    protocol: await protocol.tokenBalance(USDC),
                    integrator: await integrator.tokenBalance(USDC)
                },
                weth: {
                    maker: await maker.tokenBalance(WETH),
                    taker: await taker.tokenBalance(WETH),
                    protocol: await protocol.tokenBalance(WETH),
                    integrator: await integrator.tokenBalance(WETH)
                }
            }

            const takerAddress = new Address(await taker.getAddress())

            const order = FusionOrder.new(
                new Address(EXT_ADDRESS),
                {
                    maker: new Address(await maker.getAddress()),
                    makerAsset: new Address(WETH),
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
                },
                {
                    fees: Fees.integratorFee(
                        new IntegratorFee(
                            integratorAddress,
                            new Address(await protocol.getAddress()),
                            Bps.fromPercent(1),
                            Bps.fromPercent(50)
                        )
                    )
                }
            )

            const signature = await maker.signTypedData(order.getTypedData(1))

            const data = LimitOrderContract.getFillOrderArgsCalldata(
                order.build(),
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
                    protocol: await protocol.tokenBalance(USDC),
                    integrator: await integrator.tokenBalance(USDC)
                },
                weth: {
                    maker: await maker.tokenBalance(WETH),
                    taker: await taker.tokenBalance(WETH),
                    protocol: await protocol.tokenBalance(WETH),
                    integrator: await integrator.tokenBalance(WETH)
                }
            }

            expect(initBalances.weth.maker - finalBalances.weth.maker).toBe(
                order.makingAmount
            )
            expect(finalBalances.usdc.maker - initBalances.usdc.maker).toBe(
                order.takingAmount
            )

            expect(finalBalances.weth.taker - initBalances.weth.taker).toBe(
                order.makingAmount
            )
            expect(initBalances.usdc.taker - finalBalances.usdc.taker).toBe(
                order.calcTakingAmount(
                    takerAddress,
                    order.makingAmount,
                    now(),
                    0n
                )
            )

            expect(
                finalBalances.usdc.protocol - initBalances.usdc.protocol
            ).toBe(order.getProtocolFee(takerAddress, now(), 0n))
            expect(
                finalBalances.weth.protocol - initBalances.weth.protocol
            ).toBe(0n)

            expect(
                finalBalances.usdc.integrator - initBalances.usdc.integrator
            ).toBe(order.getIntegratorFee(takerAddress, now(), 0n))
            expect(
                finalBalances.weth.integrator - initBalances.weth.integrator
            ).toBe(0n)
        })
        it('only resolver fee', async () => {
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
                }
            }

            const takerAddress = new Address(await taker.getAddress())

            const order = FusionOrder.new(
                new Address(EXT_ADDRESS),
                {
                    maker: new Address(await maker.getAddress()),
                    makerAsset: new Address(WETH),
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
                },
                {
                    fees: Fees.resolverFee(
                        new ResolverFee(
                            new Address(await protocol.getAddress()),
                            Bps.fromPercent(1)
                        )
                    )
                }
            )

            const signature = await maker.signTypedData(order.getTypedData(1))

            const data = LimitOrderContract.getFillOrderArgsCalldata(
                order.build(),
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
                }
            }

            expect(initBalances.weth.maker - finalBalances.weth.maker).toBe(
                order.makingAmount
            )
            expect(finalBalances.usdc.maker - initBalances.usdc.maker).toBe(
                order.takingAmount
            )

            expect(finalBalances.weth.taker - initBalances.weth.taker).toBe(
                order.makingAmount
            )
            expect(initBalances.usdc.taker - finalBalances.usdc.taker).toBe(
                order.calcTakingAmount(
                    takerAddress,
                    order.makingAmount,
                    now(),
                    0n
                )
            )

            expect(
                finalBalances.usdc.protocol - initBalances.usdc.protocol
            ).toBe(order.getProtocolFee(takerAddress, now(), 0n))
            expect(
                finalBalances.weth.protocol - initBalances.weth.protocol
            ).toBe(0n)
        })
        it('resolver and integrator fees', async () => {
            const integratorAddress = Address.fromBigInt(1337n)
            const protocolAddress = new Address(await protocol.getAddress())
            const integrator = await TestWallet.fromAddress(
                integratorAddress,
                testNode.provider
            )
            const initBalances = {
                usdc: {
                    maker: await maker.tokenBalance(USDC),
                    taker: await taker.tokenBalance(USDC),
                    protocol: await protocol.tokenBalance(USDC),
                    integrator: await integrator.tokenBalance(USDC)
                },
                weth: {
                    maker: await maker.tokenBalance(WETH),
                    taker: await taker.tokenBalance(WETH),
                    protocol: await protocol.tokenBalance(WETH),
                    integrator: await integrator.tokenBalance(WETH)
                }
            }

            const takerAddress = new Address(await taker.getAddress())

            const order = FusionOrder.new(
                new Address(EXT_ADDRESS),
                {
                    maker: new Address(await maker.getAddress()),
                    makerAsset: new Address(WETH),
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
                },
                {
                    fees: new Fees(
                        new ResolverFee(
                            new Address(await protocol.getAddress()),
                            Bps.fromPercent(1)
                        ),
                        new IntegratorFee(
                            integratorAddress,
                            protocolAddress,
                            Bps.fromPercent(0.1),
                            Bps.fromPercent(10)
                        )
                    )
                }
            )

            const signature = await maker.signTypedData(order.getTypedData(1))

            const data = LimitOrderContract.getFillOrderArgsCalldata(
                order.build(),
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
                    protocol: await protocol.tokenBalance(USDC),
                    integrator: await integrator.tokenBalance(USDC)
                },
                weth: {
                    maker: await maker.tokenBalance(WETH),
                    taker: await taker.tokenBalance(WETH),
                    protocol: await protocol.tokenBalance(WETH),
                    integrator: await integrator.tokenBalance(WETH)
                }
            }

            expect(initBalances.weth.maker - finalBalances.weth.maker).toBe(
                order.makingAmount
            )
            expect(finalBalances.usdc.maker - initBalances.usdc.maker).toBe(
                order.takingAmount
            )

            expect(finalBalances.weth.taker - initBalances.weth.taker).toBe(
                order.makingAmount
            )
            expect(initBalances.usdc.taker - finalBalances.usdc.taker).toBe(
                order.calcTakingAmount(
                    takerAddress,
                    order.makingAmount,
                    now(),
                    0n
                )
            )

            expect(
                finalBalances.usdc.protocol - initBalances.usdc.protocol
            ).toBe(order.getProtocolFee(takerAddress, now(), 0n))
            expect(
                finalBalances.weth.protocol - initBalances.weth.protocol
            ).toBe(0n)

            expect(
                finalBalances.usdc.integrator - initBalances.usdc.integrator
            ).toBe(order.getIntegratorFee(takerAddress, now(), 0n))
            expect(
                finalBalances.weth.integrator - initBalances.weth.integrator
            ).toBe(0n)
        })

        it('resolver and integrator fees with custom receiver', async () => {
            const integratorAddress = Address.fromBigInt(1337n)
            const protocolAddress = new Address(await protocol.getAddress())
            const customReceiver = await TestWallet.fromAddress(
                Address.fromBigInt(1312n),
                testNode.provider
            )

            const integrator = await TestWallet.fromAddress(
                integratorAddress,
                testNode.provider
            )
            const initBalances = {
                usdc: {
                    maker: await maker.tokenBalance(USDC),
                    taker: await taker.tokenBalance(USDC),
                    protocol: await protocol.tokenBalance(USDC),
                    integrator: await integrator.tokenBalance(USDC),
                    receiver: await customReceiver.tokenBalance(USDC)
                },
                weth: {
                    maker: await maker.tokenBalance(WETH),
                    taker: await taker.tokenBalance(WETH),
                    protocol: await protocol.tokenBalance(WETH),
                    integrator: await integrator.tokenBalance(WETH),
                    receiver: await customReceiver.tokenBalance(WETH)
                }
            }

            const takerAddress = new Address(await taker.getAddress())

            const order = FusionOrder.new(
                new Address(EXT_ADDRESS),
                {
                    maker: new Address(await maker.getAddress()),
                    makerAsset: new Address(WETH),
                    takerAsset: new Address(USDC),
                    makingAmount: parseEther('0.1'),
                    takingAmount: parseUnits('100', 6),
                    receiver: new Address(await customReceiver.getAddress())
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
                },
                {
                    fees: new Fees(
                        new ResolverFee(
                            new Address(await protocol.getAddress()),
                            Bps.fromPercent(1)
                        ),
                        new IntegratorFee(
                            integratorAddress,
                            protocolAddress,
                            Bps.fromPercent(0.1),
                            Bps.fromPercent(10)
                        )
                    )
                }
            )

            const signature = await maker.signTypedData(order.getTypedData(1))

            const data = LimitOrderContract.getFillOrderArgsCalldata(
                order.build(),
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
                    protocol: await protocol.tokenBalance(USDC),
                    integrator: await integrator.tokenBalance(USDC),
                    receiver: await customReceiver.tokenBalance(USDC)
                },
                weth: {
                    maker: await maker.tokenBalance(WETH),
                    taker: await taker.tokenBalance(WETH),
                    protocol: await protocol.tokenBalance(WETH),
                    integrator: await integrator.tokenBalance(WETH),
                    receiver: await customReceiver.tokenBalance(WETH)
                }
            }

            expect(initBalances.weth.maker - finalBalances.weth.maker).toBe(
                order.makingAmount
            )
            expect(finalBalances.usdc.maker - initBalances.usdc.maker).toBe(0n)

            expect(
                initBalances.weth.receiver - finalBalances.weth.receiver
            ).toBe(0n)
            expect(
                finalBalances.usdc.receiver - initBalances.usdc.receiver
            ).toBe(order.takingAmount)

            expect(finalBalances.weth.taker - initBalances.weth.taker).toBe(
                order.makingAmount
            )
            expect(initBalances.usdc.taker - finalBalances.usdc.taker).toBe(
                order.calcTakingAmount(
                    takerAddress,
                    order.makingAmount,
                    now(),
                    0n
                )
            )

            expect(
                finalBalances.usdc.protocol - initBalances.usdc.protocol
            ).toBe(order.getProtocolFee(takerAddress, now(), 0n))
            expect(
                finalBalances.weth.protocol - initBalances.weth.protocol
            ).toBe(0n)

            expect(
                finalBalances.usdc.integrator - initBalances.usdc.integrator
            ).toBe(order.getIntegratorFee(takerAddress, now(), 0n))
            expect(
                finalBalances.weth.integrator - initBalances.weth.integrator
            ).toBe(0n)
        })

        it('resolver and integrator fees with auction', async () => {
            const integratorAddress = Address.fromBigInt(1337n)
            const protocolAddress = new Address(await protocol.getAddress())
            const integrator = await TestWallet.fromAddress(
                integratorAddress,
                testNode.provider
            )
            const initBalances = {
                usdc: {
                    maker: await maker.tokenBalance(USDC),
                    taker: await taker.tokenBalance(USDC),
                    protocol: await protocol.tokenBalance(USDC),
                    integrator: await integrator.tokenBalance(USDC)
                },
                weth: {
                    maker: await maker.tokenBalance(WETH),
                    taker: await taker.tokenBalance(WETH),
                    protocol: await protocol.tokenBalance(WETH),
                    integrator: await integrator.tokenBalance(WETH)
                }
            }

            const takerAddress = new Address(await taker.getAddress())

            const currentTime = now()

            const order = FusionOrder.new(
                new Address(EXT_ADDRESS),
                {
                    maker: new Address(await maker.getAddress()),
                    makerAsset: new Address(WETH),
                    takerAsset: new Address(USDC),
                    makingAmount: parseEther('0.1'),
                    takingAmount: parseUnits('100', 6)
                },
                {
                    auction: new AuctionDetails({
                        duration: 120n,
                        startTime: currentTime,
                        points: [],
                        initialRateBump: Number(
                            AuctionCalculator.RATE_BUMP_DENOMINATOR
                        )
                    }),
                    whitelist: Whitelist.new(0n, [
                        {address: takerAddress, allowFrom: 0n}
                    ]),
                    surplus: SurplusParams.NO_FEE
                },
                {
                    fees: new Fees(
                        new ResolverFee(
                            new Address(await protocol.getAddress()),
                            Bps.fromPercent(1)
                        ),
                        new IntegratorFee(
                            integratorAddress,
                            protocolAddress,
                            Bps.fromPercent(0.1),
                            Bps.fromPercent(10)
                        )
                    )
                }
            )

            const fillAmount = order.makingAmount / 2n
            const signature = await maker.signTypedData(order.getTypedData(1))

            const data = LimitOrderContract.getFillOrderArgsCalldata(
                order.build(),
                signature,
                TakerTraits.default()
                    .setExtension(order.extension)
                    .setAmountMode(AmountMode.maker),
                fillAmount
            )

            const {blockTimestamp, blockHash} = await taker.send({
                data,
                to: ONE_INCH_LIMIT_ORDER_V4
            })

            const baseFee = (await testNode.provider.getBlock(blockHash))
                ?.baseFeePerGas
            assert(baseFee)

            const finalBalances = {
                usdc: {
                    maker: await maker.tokenBalance(USDC),
                    taker: await taker.tokenBalance(USDC),
                    protocol: await protocol.tokenBalance(USDC),
                    integrator: await integrator.tokenBalance(USDC)
                },
                weth: {
                    maker: await maker.tokenBalance(WETH),
                    taker: await taker.tokenBalance(WETH),
                    protocol: await protocol.tokenBalance(WETH),
                    integrator: await integrator.tokenBalance(WETH)
                }
            }

            expect(initBalances.weth.maker - finalBalances.weth.maker).toBe(
                fillAmount
            )
            expect(finalBalances.usdc.maker - initBalances.usdc.maker).toBe(
                order.getUserReceiveAmount(
                    takerAddress,
                    fillAmount,
                    blockTimestamp,
                    baseFee
                )
            )

            expect(finalBalances.weth.taker - initBalances.weth.taker).toBe(
                fillAmount
            )
            expect(initBalances.usdc.taker - finalBalances.usdc.taker).toBe(
                order.calcTakingAmount(
                    takerAddress,
                    fillAmount,
                    blockTimestamp,
                    baseFee
                )
            )

            expect(
                finalBalances.usdc.protocol - initBalances.usdc.protocol
            ).toBe(
                order.getProtocolFee(
                    takerAddress,
                    blockTimestamp,
                    baseFee,
                    fillAmount
                )
            )
            expect(
                finalBalances.weth.protocol - initBalances.weth.protocol
            ).toBe(0n)

            expect(
                finalBalances.usdc.integrator - initBalances.usdc.integrator
            ).toBe(
                order.getIntegratorFee(
                    takerAddress,
                    blockTimestamp,
                    baseFee,
                    fillAmount
                )
            )
            expect(
                finalBalances.weth.integrator - initBalances.weth.integrator
            ).toBe(0n)
        })

        it('resolver and integrator fees with auction and surplus fee', async () => {
            const integratorAddress = Address.fromBigInt(1337n)
            const protocolAddress = new Address(await protocol.getAddress())
            const integrator = await TestWallet.fromAddress(
                integratorAddress,
                testNode.provider
            )
            const initBalances = {
                usdc: {
                    maker: await maker.tokenBalance(USDC),
                    taker: await taker.tokenBalance(USDC),
                    protocol: await protocol.tokenBalance(USDC),
                    integrator: await integrator.tokenBalance(USDC)
                },
                weth: {
                    maker: await maker.tokenBalance(WETH),
                    taker: await taker.tokenBalance(WETH),
                    protocol: await protocol.tokenBalance(WETH),
                    integrator: await integrator.tokenBalance(WETH)
                }
            }

            const takerAddress = new Address(await taker.getAddress())

            const currentTime = now()

            const order = FusionOrder.new(
                new Address(EXT_ADDRESS),
                {
                    maker: new Address(await maker.getAddress()),
                    makerAsset: new Address(WETH),
                    takerAsset: new Address(USDC),
                    makingAmount: parseEther('0.1'),
                    takingAmount: parseUnits('100', 6) // will be 200 at time of fill because of rate bump
                },
                {
                    auction: new AuctionDetails({
                        duration: 120n,
                        startTime: currentTime,
                        points: [],
                        initialRateBump: Number(
                            AuctionCalculator.RATE_BUMP_DENOMINATOR
                        )
                    }),
                    whitelist: Whitelist.new(0n, [
                        {address: takerAddress, allowFrom: 0n}
                    ]),
                    surplus: new SurplusParams(
                        parseUnits('100', 6),
                        Bps.fromPercent(50)
                    )
                },
                {
                    fees: new Fees(
                        new ResolverFee(
                            new Address(await protocol.getAddress()),
                            Bps.fromPercent(1)
                        ),
                        new IntegratorFee(
                            integratorAddress,
                            protocolAddress,
                            Bps.fromPercent(0.1),
                            Bps.fromPercent(10)
                        )
                    )
                }
            )

            const fillAmount = order.makingAmount / 2n
            const signature = await maker.signTypedData(order.getTypedData(1))

            const data = LimitOrderContract.getFillOrderArgsCalldata(
                order.build(),
                signature,
                TakerTraits.default()
                    .setExtension(order.extension)
                    .setAmountMode(AmountMode.maker),
                fillAmount
            )

            const {blockTimestamp, blockHash} = await taker.send({
                data,
                to: ONE_INCH_LIMIT_ORDER_V4
            })

            const baseFee = (await testNode.provider.getBlock(blockHash))
                ?.baseFeePerGas
            assert(baseFee)

            const finalBalances = {
                usdc: {
                    maker: await maker.tokenBalance(USDC),
                    taker: await taker.tokenBalance(USDC),
                    protocol: await protocol.tokenBalance(USDC),
                    integrator: await integrator.tokenBalance(USDC)
                },
                weth: {
                    maker: await maker.tokenBalance(WETH),
                    taker: await taker.tokenBalance(WETH),
                    protocol: await protocol.tokenBalance(WETH),
                    integrator: await integrator.tokenBalance(WETH)
                }
            }

            expect(initBalances.weth.maker - finalBalances.weth.maker).toBe(
                fillAmount
            )

            expect(finalBalances.usdc.maker - initBalances.usdc.maker).toBe(
                order.getUserReceiveAmount(
                    takerAddress,
                    fillAmount,
                    blockTimestamp,
                    baseFee
                )
            )

            expect(finalBalances.weth.taker - initBalances.weth.taker).toBe(
                fillAmount
            )
            expect(initBalances.usdc.taker - finalBalances.usdc.taker).toBe(
                order.calcTakingAmount(
                    takerAddress,
                    fillAmount,
                    blockTimestamp,
                    baseFee
                )
            )

            expect(
                finalBalances.usdc.protocol - initBalances.usdc.protocol
            ).toBe(
                order.getProtocolFee(
                    takerAddress,
                    blockTimestamp,
                    baseFee,
                    fillAmount
                ) +
                    order.getSurplusFee(
                        takerAddress,
                        fillAmount,
                        blockTimestamp,
                        baseFee
                    )
            )
            expect(
                finalBalances.weth.protocol - initBalances.weth.protocol
            ).toBe(0n)

            expect(
                finalBalances.usdc.integrator - initBalances.usdc.integrator
            ).toBe(
                order.getIntegratorFee(
                    takerAddress,
                    blockTimestamp,
                    baseFee,
                    fillAmount
                )
            )
            expect(
                finalBalances.weth.integrator - initBalances.weth.integrator
            ).toBe(0n)
        })
    })

    it('should execute order with PermitTransferFrom', async () => {
        const takerAddress = new Address(await taker.getAddress())
        const makerAddress = new Address(await maker.getAddress())

        const order = FusionOrder.new(
            new Address(EXT_ADDRESS),
            {
                maker: makerAddress,
                makerAsset: new Address(WETH),
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
            },
            {
                allowPartialFills: false,
                allowMultipleFills: false,
                nonce: 1n,
                enablePermit2: true
            }
        )

        const permit = order.createTransferPermit(1)
        const permitSignature = await maker.signTypedData(
            permit.getTypedData(1)
        )

        const orderWithPermit = order.withTransferPermit(
            permit,
            permitSignature
        )

        const signature = await maker.signTypedData(
            orderWithPermit.getTypedData(1)
        )

        const data = LimitOrderContract.getFillOrderArgsCalldata(
            orderWithPermit.build(),
            signature,
            TakerTraits.default()
                .setExtension(orderWithPermit.extension)
                .setAmountMode(AmountMode.maker),
            orderWithPermit.makingAmount
        )

        await taker.send({
            data,
            to: ONE_INCH_LIMIT_ORDER_V4
        })

        const finalBalances = {
            usdc: {
                maker: await maker.tokenBalance(USDC)
            },
            weth: {
                maker: await maker.tokenBalance(WETH)
            }
        }

        expect(finalBalances.usdc.maker).toBeGreaterThan(0n)
    })

    it('should execute with custom receiver no fee', async () => {
        const customReceiver = await TestWallet.fromAddress(
            Address.fromBigInt(1337n),
            testNode.provider
        )

        const initBalances = {
            usdc: {
                maker: await maker.tokenBalance(USDC),
                taker: await taker.tokenBalance(USDC),
                protocol: await protocol.tokenBalance(USDC),
                receiver: await customReceiver.tokenBalance(USDC)
            },
            weth: {
                maker: await maker.tokenBalance(WETH),
                taker: await taker.tokenBalance(WETH),
                protocol: await protocol.tokenBalance(WETH),
                receiver: await customReceiver.tokenBalance(WETH)
            }
        }

        const takerAddress = new Address(await taker.getAddress())

        const order = FusionOrder.new(
            new Address(EXT_ADDRESS),
            {
                maker: new Address(await maker.getAddress()),
                makerAsset: new Address(WETH),
                takerAsset: new Address(USDC),
                makingAmount: parseEther('0.1'),
                takingAmount: parseUnits('100', 6),
                receiver: new Address(await customReceiver.getAddress())
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

        const signature = await maker.signTypedData(order.getTypedData(1))

        const data = LimitOrderContract.getFillOrderArgsCalldata(
            order.build(),
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
                protocol: await protocol.tokenBalance(USDC),
                receiver: await customReceiver.tokenBalance(USDC)
            },
            weth: {
                maker: await maker.tokenBalance(WETH),
                taker: await taker.tokenBalance(WETH),
                protocol: await protocol.tokenBalance(WETH),
                receiver: await customReceiver.tokenBalance(WETH)
            }
        }

        expect(initBalances.weth.maker - finalBalances.weth.maker).toBe(
            order.makingAmount
        )
        expect(finalBalances.usdc.maker - initBalances.usdc.maker).toBe(0n)
        expect(finalBalances.usdc.receiver - initBalances.usdc.receiver).toBe(
            order.takingAmount
        )
        expect(finalBalances.weth.receiver - initBalances.weth.receiver).toBe(
            0n
        )

        expect(finalBalances.weth.taker - initBalances.weth.taker).toBe(
            order.makingAmount
        )
        expect(initBalances.usdc.taker - finalBalances.usdc.taker).toBe(
            order.takingAmount
        )
    })
})
