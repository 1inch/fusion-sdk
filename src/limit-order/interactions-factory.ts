import {ZERO_ADDRESS} from '../constants'

export class InteractionsFactory {
    static unwrap(wethUnwrapper: string, receiverAddress: string): string {
        // in case maker == receiver address, we don't need to add the address
        if (receiverAddress === ZERO_ADDRESS) {
            return wethUnwrapper
        }

        return wethUnwrapper + receiverAddress.substring(2)
    }
}
