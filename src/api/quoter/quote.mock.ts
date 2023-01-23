import {QuoterResponse} from './types'

export const QuoterResponseMock: QuoterResponse = {
    fromTokenAmount: '1000000000000000000000',
    feeToken: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    presets: {
        fast: {
            auctionDuration: 180,
            startAuctionIn: 36,
            bankFee: '0',
            initialRateBump: 200461,
            auctionStartAmount: '626771998563995046',
            auctionEndAmount: '614454580595911348',
            tokenFee: '9183588477842300',
            points: [
                {
                    delay: 24,
                    coefficient: 50461
                }
            ]
        },
        medium: {
            auctionDuration: 180,
            startAuctionIn: 12,
            bankFee: '0',
            initialRateBump: 210661,
            auctionStartAmount: '627398742236202876',
            auctionEndAmount: '614454580595911348',
            tokenFee: '9183588477842300',
            points: [
                {
                    delay: 24,
                    coefficient: 50461
                }
            ]
        },
        slow: {
            auctionDuration: 600,
            startAuctionIn: 12,
            bankFee: '0',
            initialRateBump: 302466,
            auctionStartAmount: '633039742513363640',
            auctionEndAmount: '614454580595911348',
            tokenFee: '9183588477842300',
            points: [
                {
                    delay: 24,
                    coefficient: 50461
                }
            ]
        }
    },
    toTokenAmount: '626772029219852913',
    prices: {
        usd: {
            fromToken: '0.99326233048693179928',
            toToken: '1618.25668999999970765202'
        }
    },
    volume: {
        usd: {
            fromToken: '993.26233048693179928',
            toToken: '1014.278029389902274042'
        }
    },
    quoteId: null
}
