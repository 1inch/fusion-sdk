export function castUrl(url: string): string {
    if (url.startsWith('http')) {
        return url.replace('http', 'ws')
    }

    return url
}
