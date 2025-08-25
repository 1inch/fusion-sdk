import {
    AbiCoder,
    Contract,
    JsonRpcProvider,
    Signer,
    TransactionRequest,
    Wallet as PKWallet
} from 'ethers'
import {Address} from '@1inch/limit-order-sdk'
import ERC20 from '../dist/contracts/IERC20.sol/IERC20.json'
import {EIP712TypedData} from '../src/index.js'

const coder = AbiCoder.defaultAbiCoder()

export class TestWallet {
    public provider: JsonRpcProvider

    public signer: Signer

    constructor(
        privateKeyOrSigner: string | Signer,
        provider: JsonRpcProvider
    ) {
        this.provider = provider
        this.signer =
            typeof privateKeyOrSigner === 'string'
                ? new PKWallet(privateKeyOrSigner, this.provider)
                : privateKeyOrSigner
    }

    static async signTypedData(
        signer: Signer,
        typedData: EIP712TypedData
    ): Promise<string> {
        return signer.signTypedData(
            typedData.domain,
            {Order: typedData.types[typedData.primaryType]},
            typedData.message
        )
    }

    public static async fromAddress(
        address: string | Address,
        provider: JsonRpcProvider
    ): Promise<TestWallet> {
        await provider.send('anvil_impersonateAccount', [address.toString()])

        const signer = await provider.getSigner(address.toString())

        return new TestWallet(signer, provider)
    }

    async tokenBalance(token: string): Promise<bigint> {
        const tokenContract = new Contract(
            token.toString(),
            ERC20.abi,
            this.provider
        )

        return tokenContract.balanceOf(await this.getAddress())
    }

    public async nativeBalance(): Promise<bigint> {
        return this.provider.getBalance(await this.getAddress())
    }

    async topUpFromDonor(
        token: string,
        donor: string,
        amount: bigint
    ): Promise<void> {
        const donorWallet = await TestWallet.fromAddress(donor, this.provider)
        await donorWallet.transferToken(token, await this.getAddress(), amount)
    }

    public async getAddress(): Promise<string> {
        return this.signer.getAddress()
    }

    public async unlimitedApprove(
        tokenAddress: string,
        spender: string
    ): Promise<void> {
        const currentApprove = await this.getAllowance(tokenAddress, spender)

        // for usdt like tokens
        if (currentApprove !== 0n) {
            await this.approveToken(tokenAddress, spender, 0n)
        }

        await this.approveToken(tokenAddress, spender, (1n << 256n) - 1n)
    }

    public async getAllowance(token: string, spender: string): Promise<bigint> {
        const contract = new Contract(
            token.toString(),
            ERC20.abi,
            this.provider
        )

        return contract.allowance(await this.getAddress(), spender.toString())
    }

    public async transfer(dest: string, amount: bigint): Promise<void> {
        await this.signer.sendTransaction({
            to: dest,
            value: amount
        })
    }

    public async transferToken(
        token: string,
        dest: string,
        amount: bigint
    ): Promise<void> {
        const tx = await this.signer.sendTransaction({
            to: token.toString(),
            data:
                '0xa9059cbb' +
                coder
                    .encode(['address', 'uint256'], [dest.toString(), amount])
                    .slice(2),
            gasLimit: 1_000_000
        })

        await tx.wait()
    }

    public async approveToken(
        token: string,
        spender: string,
        amount: bigint
    ): Promise<void> {
        const tx = await this.signer.sendTransaction({
            to: token.toString(),
            data:
                '0x095ea7b3' +
                coder
                    .encode(
                        ['address', 'uint256'],
                        [spender.toString(), amount]
                    )
                    .slice(2)
        })

        await tx.wait()
    }

    public async signTypedData(typedData: EIP712TypedData): Promise<string> {
        return TestWallet.signTypedData(this.signer, typedData)
    }

    async send(
        param: TransactionRequest
    ): Promise<{txHash: string; blockTimestamp: bigint; blockHash: string}> {
        const res = await this.signer.sendTransaction({
            ...param,
            gasLimit: 10_000_000,
            from: this.getAddress()
        })
        const receipt = await res.wait(1)

        if (receipt && receipt.status) {
            return {
                txHash: receipt.hash,
                blockTimestamp: BigInt((await res.getBlock())!.timestamp),
                blockHash: res.blockHash as string
            }
        }

        throw new Error((await receipt?.getResult()) || 'unknown error')
    }
}
