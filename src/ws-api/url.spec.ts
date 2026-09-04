import {castUrl} from './url.js'

describe('castUrl', () => {
    it('rewrites http(s) to ws(s) and leaves ws urls alone', () => {
        expect(castUrl('https://api.example.com')).toBe('wss://api.example.com')
        expect(castUrl('http://api.example.com')).toBe('ws://api.example.com')
        expect(castUrl('wss://api.example.com')).toBe('wss://api.example.com')
    })
})
