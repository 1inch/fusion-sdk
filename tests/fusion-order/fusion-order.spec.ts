import {parseEther, parseUnits} from 'ethers'
import {Bps} from '@1inch/limit-order-sdk'
import {
    Fees,
    IntegratorFee,
    ResolverFee
} from '@1inch/limit-order-sdk/extensions/fee-taker'

import {
    Address,
    AmountMode,
    AuctionDetails,
    FusionOrder,
    LimitOrderContract,
    ONE_INCH_LIMIT_ORDER_V4,
    TakerTraits,
    Whitelist
} from '../../src'
import '../global.d.ts'
import {USDC, WETH} from '../addresses'
import {TestWallet} from '../test-wallet'

import {now} from '../utils'

// eslint-disable-next-line max-lines-per-function
describe('SettlementExtension', () => {
    const maker = globalThis.maker
    const taker = globalThis.taker
    const EXT_ADDRESS = globalThis.settlementExtension

    let protocol: TestWallet
    beforeAll(async () => {
        protocol = await TestWallet.fromAddress(
            Address.fromBigInt(256n),
            globalThis.localNodeProvider
        )
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
                ])
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
                globalThis.localNodeProvider
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
                    ])
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
            ).toBe(order.getProtocolFee(takerAddress))
            expect(
                finalBalances.weth.protocol - initBalances.weth.protocol
            ).toBe(0n)

            expect(
                finalBalances.usdc.integrator - initBalances.usdc.integrator
            ).toBe(order.getIntegratorFee(takerAddress))
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
                    ])
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
            ).toBe(order.getProtocolFee(takerAddress))
            expect(
                finalBalances.weth.protocol - initBalances.weth.protocol
            ).toBe(0n)
        })
        it('resolver and integrator fees', async () => {
            const integratorAddress = Address.fromBigInt(1337n)
            const protocolAddress = new Address(await protocol.getAddress())
            const integrator = await TestWallet.fromAddress(
                integratorAddress,
                globalThis.localNodeProvider
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
                    ])
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
            ).toBe(order.getProtocolFee(takerAddress))
            expect(
                finalBalances.weth.protocol - initBalances.weth.protocol
            ).toBe(0n)

            expect(
                finalBalances.usdc.integrator - initBalances.usdc.integrator
            ).toBe(order.getIntegratorFee(takerAddress))
            expect(
                finalBalances.weth.integrator - initBalances.weth.integrator
            ).toBe(0n)
        })

        it('resolver and integrator fees with custom receiver', async () => {
            const integratorAddress = Address.fromBigInt(1337n)
            const protocolAddress = new Address(await protocol.getAddress())
            const customReceiver = await TestWallet.fromAddress(
                Address.fromBigInt(1312n),
                globalThis.localNodeProvider
            )

            const integrator = await TestWallet.fromAddress(
                integratorAddress,
                globalThis.localNodeProvider
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
                    ])
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
            ).toBe(order.getProtocolFee(takerAddress))
            expect(
                finalBalances.weth.protocol - initBalances.weth.protocol
            ).toBe(0n)

            expect(
                finalBalances.usdc.integrator - initBalances.usdc.integrator
            ).toBe(order.getIntegratorFee(takerAddress))
            expect(
                finalBalances.weth.integrator - initBalances.weth.integrator
            ).toBe(0n)
        })
    })

    it('should execute with custom receiver no fee', async () => {
        const customReceiver = await TestWallet.fromAddress(
            Address.fromBigInt(1337n),
            globalThis.localNodeProvider
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
                ])
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
