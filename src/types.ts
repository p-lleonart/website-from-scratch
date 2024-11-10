import { IncomingMessage } from "http"
import { Middleware } from "./middleware"
import { Request, Response } from "#lib/http"

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

export type ResponseContext = 'middleware' | 'route'

type RouteOptional = {
    description?: string
    middlewares?: Middleware[]

    /** this will be set by the server at launch */
    _regex?: RegExp
}

/**
 * You can set a callback or put a tuple ["YourController", "yourMethod"]
 */
export type Route = 
    | { callback: (httpContext: HttpContext) => Promise<Response>; controller?: never } & RouteOptional
    | { callback?: never; controller: [string, string] } & RouteOptional

export type Routes = { [key: string]: Route }

export type RouteParams = {
    [key: string]: string
}
