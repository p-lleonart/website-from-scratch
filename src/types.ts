import { IncomingMessage } from "http"
import { Middleware } from "./middleware"
import { Request } from "./request"
import { Response } from "./response"

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
    req?: IncomingMessage
    request: Request
    response: Response
}

export type MiddlewareHandlerContract = {
    httpContext: HttpContext
    returnResponse: boolean
}

export type Route = {
    callback: (httpContext: HttpContext) => Promise<Response>
    description?: string
    middlewares?: Middleware[]

    /** this will be set by the server at launch */
    _regex?: RegExp
}

export type RouteParams = {
    [key: string]: string
}
