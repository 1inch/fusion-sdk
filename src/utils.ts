export function trim0x(data: string): string {
    if (data.startsWith('0x')) {
        return data.substring(2)
    }

    return data
}

export function add0x(data: string): string {
    if (data.includes('0x')) {
        return data
    }

    return '0x' + data
}
