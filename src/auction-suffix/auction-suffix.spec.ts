import {AuctionSuffix} from './auction-suffix'

describe('Auction Suffix', () => {
    it('should create suffix with required params', () => {
        const suffix = new AuctionSuffix({
            points: [
                {
                    coefficient: 20000,
                    delay: 12
                }
            ],
            whitelist: [
                {
                    address: '0x00000000219ab540356cbb839cbe05303d7705fa',
                    allowance: 0
                }
            ]
        })

        expect(suffix.build()).toBe(
            '000c004e200000000000000000219ab540356cbb839cbe05303d7705faf486570009'
        )
    })

    it('should create suffix with specified public resolving deadline', () => {
        const suffix = new AuctionSuffix({
            points: [
                {
                    coefficient: 20000,
                    delay: 12
                }
            ],
            whitelist: [
                {
                    address: '0x00000000219ab540356cbb839cbe05303d7705fa',
                    allowance: 0
                }
            ],
            publicResolvingDeadline: 1673549418
        })

        expect(suffix.build()).toBe(
            '000c004e200000000000000000219ab540356cbb839cbe05303d7705fa63c0566a09'
        )
    })

    it('should create suffix with specified taker fee', () => {
        const suffix = new AuctionSuffix({
            points: [
                {
                    coefficient: 20000,
                    delay: 12
                }
            ],
            whitelist: [
                {
                    address: '0x00000000219ab540356cbb839cbe05303d7705fa',
                    allowance: 0
                }
            ],
            publicResolvingDeadline: 1673549418,
            fee: {
                takingFeeReceiver: '0x00000000219ab540356cbb839cbe05303d7705fa',
                takingFeeRatio: '100'
            }
        })

        expect(suffix.build()).toBe(
            '000c004e200000000000000000219ab540356cbb839cbe05303d7705fa63c0566a00000000000000000000006400000000219ab540356cbb839cbe05303d7705fa89'
        )
    })

    it('should decode auction suffix', () => {
        const encodedSuffix =
            '000c004e200000000000000000219ab540356cbb839cbe05303d7705fa63c0566a09'

        const suffix = AuctionSuffix.decode(encodedSuffix)

        expect(suffix.build()).toBe(encodedSuffix)
    })

    it('should decode auction suffix with taker fee', () => {
        const encodedSuffix =
            '000c004e200000000000000000219ab540356cbb839cbe05303d7705fa63c0566a00000000000000000000006400000000219ab540356cbb839cbe05303d7705fa89'.toLowerCase()

        const suffix = AuctionSuffix.decode(encodedSuffix)

        expect(suffix.build()).toBe(encodedSuffix)
    })
})
