import {QuoterWithCustomPresetBodyRequest} from './quoter-with-custom-preset.request'

describe(__filename, () => {
    it('auctionStartAmount should be valid', () => {
        const body = QuoterWithCustomPresetBodyRequest.new({
            customPreset: {
                auctionDuration: 180,
                auctionStartAmount: 'ama bad string',
                auctionEndAmount: '50000',
                points: [
                    {toTokenAmount: '90000', delay: 20},
                    {toTokenAmount: '110000', delay: 40}
                ]
            }
        })

        const err = body.validate()

        expect(err).toMatch(/Invalid auctionStartAmount/)
    })

    it('auctionEndAmount should be valid', () => {
        const body = QuoterWithCustomPresetBodyRequest.new({
            customPreset: {
                auctionDuration: 180,
                auctionStartAmount: '100000',
                auctionEndAmount: 'ama bad string',
                points: [
                    {toTokenAmount: '90000', delay: 20},
                    {toTokenAmount: '110000', delay: 40}
                ]
            }
        })

        const err = body.validate()

        expect(err).toMatch(/Invalid auctionEndAmount/)
    })

    it('auctionDuration should be valid', () => {
        const body = QuoterWithCustomPresetBodyRequest.new({
            customPreset: {
                auctionDuration: 0.1,
                auctionStartAmount: '100000',
                auctionEndAmount: '50000',
                points: [
                    {toTokenAmount: '90000', delay: 20},
                    {toTokenAmount: '110000', delay: 40}
                ]
            }
        })

        const err = body.validate()

        expect(err).toMatch(/auctionDuration should be integer/)
    })

    it('points should be in range', () => {
        const body1 = QuoterWithCustomPresetBodyRequest.new({
            customPreset: {
                auctionDuration: 180,
                auctionStartAmount: '100000',
                auctionEndAmount: '50000',
                points: [
                    {toTokenAmount: '90000', delay: 20},
                    {toTokenAmount: '110000', delay: 40}
                ]
            }
        })

        const body2 = QuoterWithCustomPresetBodyRequest.new({
            customPreset: {
                auctionDuration: 180,
                auctionStartAmount: '100000',
                auctionEndAmount: '50000',
                points: [
                    {toTokenAmount: '40000', delay: 20},
                    {toTokenAmount: '70000', delay: 40}
                ]
            }
        })

        const err1 = body1.validate()
        const err2 = body2.validate()

        expect(err1).toMatch(/points should be in range/)

        expect(err2).toMatch(/points should be in range/)
    })

    it('points should be an array of valid amounts', () => {
        const body = QuoterWithCustomPresetBodyRequest.new({
            customPreset: {
                auctionDuration: 180,
                auctionStartAmount: '100000',
                auctionEndAmount: '50000',
                points: [
                    {toTokenAmount: 'ama bad string', delay: 20},
                    {toTokenAmount: '70000', delay: 40}
                ]
            }
        })

        const err = body.validate()

        expect(err).toMatch(/points should be an array of valid amounts/)
    })
})
