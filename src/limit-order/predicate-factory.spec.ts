import {PredicateFactory} from './predicate-factory'
import {toSec} from '../utils'

describe('Predicate Factory', () => {
    jest.spyOn(Date, 'now').mockReturnValue(1673549418040)

    it('should create timestampBelow predicate', () => {
        const expirationTime = toSec(Date.now()) + 60

        const predicate = PredicateFactory.timestampBelow(expirationTime)

        expect(predicate).toBe(
            '0x63592c2b0000000000000000000000000000000000000000000000000000000063c056a6'
        )
    })

    it('should create timestampBelowAndNonceEquals predicate', () => {
        const account = '0x00000000219ab540356cbb839cbe05303d7705fa'
        const nonce = '1'
        const expirationTime = toSec(Date.now()) + 60

        const predicate = PredicateFactory.timestampBelowAndNonceEquals(
            account,
            nonce,
            expirationTime
        )

        expect(predicate).toBe(
            '0x2cc2878d000063c056a600000000000100000000219ab540356cbb839cbe05303d7705fa'
        )
    })

    it('should parse timestampBelow predicate expiration time', () => {
        const predicate =
            '0x63592c2b0000000000000000000000000000000000000000000000000000000063c056a6'
        const expirationTime = PredicateFactory.parseExpirationTime(predicate)

        expect(expirationTime).toBe(1673549478)
    })

    it('should parse timestampBelowAndNonceEquals predicate expiration time', () => {
        const predicate =
            '0x2cc2878d000063c056a600000000000100000000219ab540356cbb839cbe05303d7705fa'
        const expirationTime = PredicateFactory.parseExpirationTime(predicate)

        expect(expirationTime).toBe(1673549478)
    })

    it('should return null on non exising expiration time', () => {
        const predicate = '0x12345678'
        const expirationTime = PredicateFactory.parseExpirationTime(predicate)

        expect(expirationTime).toBe(null)
    })
})
