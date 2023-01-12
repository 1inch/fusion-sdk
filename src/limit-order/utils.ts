export function buildSalt(): string {
    return Math.round(Math.random() * Date.now()) + '';
}
