import { IncomingMessage } from "http"
import { Middleware } from "./middleware"
import Response from "./response"

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

export type HttpContext = {
    req: IncomingMessage
    response: Response
}

export type Route = {
    callback: Function
    description?: string
    middlewares?: Middleware[]
}
