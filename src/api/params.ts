import {VERSION} from './version'

/**
 * Concat all params to query encoded string. `version` param added to this string
 */
export function concatQueryParamsWithVersion<
    T extends Record<string | number, string | string[] | number | boolean>
>(params: T): string {
    if (!params) {
        return `?version=${VERSION}`
    }

    Object.assign(params, {version: VERSION})

    const keys = Object.keys(params)

    return (
        '?' +
        keys
            .reduce((a, k) => {
                if (!params[k]) {
                    return a
                }

                const value = params[k]
                a.push(
                    k +
                        '=' +
                        encodeURIComponent(
                            Array.isArray(value) ? value.join(',') : value
                        )
                )

                return a
            }, [] as string[])
            .join('&')
    )
}
