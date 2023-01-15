import {AuctionSalt} from './auction-salt'
import crypto from 'crypto'

describe('Auction Salt', () => {
    jest.spyOn(crypto, 'randomInt').mockImplementation(() => 1000)

    it('should create salt', () => {
        const salt = new AuctionSalt({
            duration: 180,
            auctionStartTime: 1673548149,
            initialRateBump: 50000,
            bankFee: '0'
        })

        expect(salt.build()).toBe(
            '45118768841948961586167738353692277076075522015101619148498725069326976549864'
        )
    })

    it('should create salt with non zero bank fee', () => {
        const salt = new AuctionSalt({
            duration: 180,
            auctionStartTime: 1673548149,
            initialRateBump: 50000,
            bankFee: '123123123'
        })

        expect(salt.build()).toBe(
            '45118768841948961586167741099429671146420854337050268925130474518618971309032'
        )
    })

    it('should fail to create salt due to wrong auction start time', () => {
        const salt = new AuctionSalt({
            duration: 180,
            auctionStartTime: 1673548149 * 1000,
            initialRateBump: 50000,
            bankFee: '123123123'
        })

        expect(() => salt.build()).toThrow(
            'Some inputs were out of allowed ranges'
        )
    })

    it('should fail to create salt due to initial rate bump out of range', () => {
        const salt = new AuctionSalt({
            duration: 180,
            auctionStartTime: 1673548149,
            initialRateBump: 16_777_215 + 1,
            bankFee: '123123123'
        })

        expect(() => salt.build()).toThrow(
            'Some inputs were out of allowed ranges'
        )
    })

    it('should fail to create salt due to wrong duration', () => {
        const salt = new AuctionSalt({
            duration: 16777215 + 1,
            auctionStartTime: 1673548149,
            initialRateBump: 50000,
            bankFee: '123123123'
        })

        expect(() => salt.build()).toThrow(
            'Some inputs were out of allowed ranges'
        )
    })

    it('should decode salt', () => {
        const encodedSalt =
            '45118768841948961586167741099429671146420854337050268925130474518618971309032'

        const salt = AuctionSalt.decode(encodedSalt)

        expect(salt.build()).toBe(encodedSalt)
    })
})
