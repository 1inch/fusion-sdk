export interface HttpProviderConnector {
    get<T>(url: string): Promise<T>

    post<T>(url: string, data: unknown): Promise<T>
}
