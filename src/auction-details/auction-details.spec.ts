import {AuctionDetails} from './auction-details'

describe('Auction details', () => {
    it('Should encode/decode details', () => {
        const details = new AuctionDetails({
            duration: 180n,
            auctionStartTime: 1673548149n,
            initialRateBump: 50000,
            points: [
                {
                    delay: 10,
                    coefficient: 40000
                },

                {
                    delay: 10,
                    coefficient: 40000
                }
            ]
        })

        expect(AuctionDetails.decode(details.encode())).toStrictEqual(details)
    })
})
