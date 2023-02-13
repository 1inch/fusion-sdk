import Contract from 'web3-eth-contract'
import Web3 from 'web3'

export function encodeNonce(
    contract: Contract.Contract,
    address: string
): string {
    return contract.methods._nonces(address).encodeABI()
}

export function decodeNonce(nonceHex: string): string {
    const web3 = new Web3('')

    return web3.eth.abi.decodeParameter('uint256', nonceHex).toString()
}
