import {concatQueryParams} from './params.js'
import {OrdersVersion} from './ordersVersion.js'

describe('concatQueryParams', () => {
    it('returns an empty string when there are no params and no version', () => {
        expect(concatQueryParams({}, false)).toBe('')
    })

    it('appends only the version when params are empty', () => {
        expect(concatQueryParams({}, OrdersVersion._2_1)).toBe('?version=2.1')
    })

    it('skips falsy values and joins arrays with commas', () => {
        const query = concatQueryParams(
            {
                page: 1,
                empty: '',
                tags: ['a', 'b'],
                flag: true
            },
            OrdersVersion._2_1
        )

        expect(query).toContain('page=1')
        expect(query).toContain('tags=a%2Cb')
        expect(query).toContain('flag=true')
        expect(query).toContain('version=2.1')
        expect(query).not.toContain('empty=')
    })

    it('does not add a version when OrdersVersion.all is selected', () => {
        expect(concatQueryParams({page: 2}, OrdersVersion.all)).toBe('?page=2')
    })

    it('returns a version-only query when params are missing', () => {
        expect(
            concatQueryParams(
                undefined as unknown as Record<string, string>,
                OrdersVersion._2_1
            )
        ).toBe('?version=2.1')
        expect(
            concatQueryParams(
                undefined as unknown as Record<string, string>,
                false
            )
        ).toBe('')
    })
})
