import {OrdersVersion} from './ordersVersion'

/**
 * Concat all params to query encoded string. if `addVersion` is true, then `version` param is added to this string
 */
export function concatQueryParams<
    T extends Record<string | number, string | string[] | number | boolean>
>(params: T, version: false | OrdersVersion = false): string {
    const versionRequired = version && version !== OrdersVersion.all

    if (!params) {
        return versionRequired ? `?version=${version}` : ''
    }

    if (versionRequired) {
        Object.assign(params, {version})
    }

    const keys = Object.keys(params)

    if (!keys.length) {
        return ''
    }

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
