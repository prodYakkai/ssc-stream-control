export interface SRSGenericResponse {
    code: number
    server: string
    service: string
    pid: string
}

export interface SRSStreamsResponse extends SRSGenericResponse {
    streams: Stream[]
}

export interface SRSStreamResponse extends SRSGenericResponse {
    stream: Stream
}

export interface SRSClientsResponse extends SRSGenericResponse {
    clients: Client[]
}

export interface SRSClientResponse extends SRSGenericResponse {
    client: Client
}

export interface Stream {
    id: string
    name: string
    vhost: string
    app: string
    tcUrl: string
    url: string
    live_ms: number
    clients: number
    frames: number
    send_bytes: number
    recv_bytes: number
    kbps: Kbps
    publish: Publish
    video: Video
    audio: Audio
}

export interface Client {
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
    kbps: Kbps
}

export interface Kbps {
    recv_30s: number
    send_30s: number
}

export interface Publish {
    active: boolean
    cid: string
}

export interface Video {
    codec: string
    profile: string
    level: string
    width: number
    height: number
}

export interface Audio {
    codec: string
    sample_rate: number
    channel: number
    profile: string
}
