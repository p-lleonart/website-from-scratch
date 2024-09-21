import { Middleware } from "./middleware"

export type Cookie = {
    name: string
    value: string
    domain?: string
    expires?: string
    httpOnly?: boolean
    maxAge?: number
    partitioned?: boolean
    path?: string
    secure?: boolean
    sameSite?: "Strict" | "Lax" | "None"
}

export type Headers = {
    [key: string]: string
}

export type Response = {
    statusCode: number
    headers: Headers
    body: string
}

export type Route = {
    callback: Function
    description?: string
    middlewares?: Middleware[]
}
