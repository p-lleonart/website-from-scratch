
export type Cookie = {
    name: string
    value: string
    domain?: string
    expires?: Date
    httpOnly?: boolean
    maxAge?: number
    partitioned?: boolean
    path?: string
    secure?: boolean
    sameSite?: "Strict" | "Lax" | "None"
}

export type Response = {
    statusCode: number
    headers: any
    body: string
}

export type Route = {
    callback: Function
    description?: string
    middlewares?: any[]
}
