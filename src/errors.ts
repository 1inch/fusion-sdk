export class AuthError extends Error {
    constructor() {
        super('Auth error, please use token from https://business.1inch.com/portal')
    }
}
