export class InteractionsFactory {
    static unwrap(
        wethUnwrapper: string,
        receiverAddress: string
    ): string {
        return wethUnwrapper + receiverAddress.substring(2)
    }
}
