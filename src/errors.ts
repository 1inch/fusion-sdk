export class AuthError extends Error {
    constructor() {
        super('Auth error, please use token from https://portal.1inch.dev/')
    }
}
