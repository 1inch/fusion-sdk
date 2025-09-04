import {isHexBytes, trim0x} from '@1inch/byte-utils'
import {Address} from '@1inch/limit-order-sdk'
import {getCreate2Address, keccak256} from 'ethers'
import assert from 'assert'

export class ProxyFactory {
    constructor(
        public readonly factory: Address,
        public readonly implementation: Address
    ) {}

    /**
     * See https://github.com/1inch/cross-chain-swap/blob/03d99b9604d8f7a5a396720fbe1059f7d94db762/contracts/libraries/ProxyHashLib.sol#L14
     */
    public static calcProxyBytecodeHash(impl: Address): string {
        return keccak256(
            `0x3d602d80600a3d3981f3363d3d373d3d3d363d73${trim0x(impl.toString())}5af43d82803e903d91602b57fd5bf3`
        )
    }

    /**
     * Calculates deterministic address of proxy contract
     *
     * @see https://github.com/OpenZeppelin/openzeppelin-contracts/blob/69c8def5f222ff96f2b5beff05dfba996368aa79/contracts/proxy/Clones.sol#L60
     *
     * @param salt must be valid hex string
     * @returns address of proxy contract
     */
    public getProxyAddress(salt: string): Address {
        assert(isHexBytes(salt), 'invalid salt')

        return new Address(
            getCreate2Address(
                this.factory.toString(),
                salt,
                ProxyFactory.calcProxyBytecodeHash(this.implementation)
            )
        )
    }
}
