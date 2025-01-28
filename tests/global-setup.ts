import {GenericContainer} from 'testcontainers'
import {LogWaitStrategy} from 'testcontainers/build/wait-strategies/log-wait-strategy'
import {
    ContractFactory,
    InterfaceAbi,
    JsonRpcProvider,
    parseEther,
    parseUnits,
    Wallet
} from 'ethers'
import './global.d.ts'
import {TestWallet} from './test-wallet'
import {USDC, WETH} from './addresses'
import FeeTakerExt from '../dist/contracts/TestSettlement.sol/TestSettlement.json'
import {ONE_INCH_LIMIT_ORDER_V4} from '../src'

export default async function setupGlobalSetup(): Promise<void> {
    await startNode()
    await deployContracts()
    await initUsers()
}

const forkUrl = process.env.FORK_URL || 'https://eth.meowrpc.com'

async function startNode(): Promise<void> {
    const innerPort = 8545
    const anvil = await new GenericContainer(
        'ghcr.io/foundry-rs/foundry:nightly-1710187c614f01598116e67aaf4cda76e7b532ec@sha256:8ff219280417ac9a288d5ce136314b38807e0df71cb9e00f4245d7a2917395ff'
    )
        .withExposedPorts(innerPort)
        .withCommand([`anvil -f ${forkUrl} --host 0.0.0.0`])
        // .withLogConsumer((s) => s.pipe(process.stdout))
        .withWaitStrategy(new LogWaitStrategy('Listening on 0.0.0.0:8545', 1))
        .withName(`anvil_limit_order_tests`)
        .start()

    const url = `http://127.0.0.1:${anvil.getMappedPort(innerPort)}`

    globalThis.localNode = anvil
    globalThis.localNodeProvider = new JsonRpcProvider(url, 1, {
        cacheTimeout: -1,
        staticNetwork: true
    })
}

async function deployContracts(): Promise<void> {
    const deployer = new Wallet(
        '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
        globalThis.localNodeProvider
    )

    globalThis.settlementExtension = await deploy(
        FeeTakerExt,
        [
            ONE_INCH_LIMIT_ORDER_V4,
            '0xacce550000159e70908c0499a1119d04e7039c28', // access token
            WETH,
            deployer.address // owner
        ],
        deployer
    )
}
async function initUsers(): Promise<void> {
    const USDC_DONOR = await TestWallet.fromAddress(
        '0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503',
        globalThis.localNodeProvider
    )

    // maker have WETH
    globalThis.maker = await TestWallet.fromAddress(
        '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        globalThis.localNodeProvider
    )
    await globalThis.maker.transfer(WETH, parseEther('5'))
    await globalThis.maker.unlimitedApprove(WETH, ONE_INCH_LIMIT_ORDER_V4)

    // Taker have USDC
    globalThis.taker = await TestWallet.fromAddress(
        '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        globalThis.localNodeProvider
    )
    await USDC_DONOR.transferToken(
        USDC,
        await globalThis.taker.getAddress(),
        parseUnits('100000', 6)
    )
    await globalThis.taker.unlimitedApprove(USDC, ONE_INCH_LIMIT_ORDER_V4)
}

/**
 * Deploy contract and return its address
 */
async function deploy(
    json: {abi: InterfaceAbi; bytecode: {object: string}},
    params: unknown[],
    deployer: Wallet
): Promise<string> {
    const deployed = await new ContractFactory(
        json.abi,
        json.bytecode,
        deployer
    ).deploy(...params)
    await deployed.waitForDeployment()

    return deployed.getAddress()
}
