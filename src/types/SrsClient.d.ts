export interface SrsApiResponse<T> {
    code: number
    data: T
}

export interface SrsClientsResponse {
    code: number
    server: string
    service: string
    pid: string
    clients: SrsClient[]
}

export interface SrsClient {
    id: string
    vhost: string
    stream: string
    ip: string
    pageUrl: string
    swfUrl: string
    tcUrl: string
    url: string
    name: string
    type: string
    publish: boolean
    alive: number
    send_bytes: number
    recv_bytes: number
    kbps: Kbps30sInterval
}

export interface Kbps30sInterval {
    recv_30s: number
    send_30s: number
}
