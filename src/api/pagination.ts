export class PaginationRequest {
    page: number | undefined

    limit: number | undefined

    constructor(page: number | undefined, limit: number | undefined) {
        this.page = page
        this.limit = limit
    }

    validate(): string | null {
        if (this.limit != null && (this.limit < 1 || this.limit > 500)) {
            return 'limit should be in range between 1 and 500'
        }

        if (this.page != null && this.page < 1) {
            return `page should be >= 1`
        }

        return null
    }
}
