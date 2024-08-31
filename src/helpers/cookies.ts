import { IncomingMessage } from "http"

import { Cookie } from "../types"
import { parseCookieData } from "./parsing"


/**
 * Returns an object containing all cookies names with their values.
 * 
 * @param req
 */
export function getCookies(req: IncomingMessage): {[key: string]: string} {
    return parseCookieData(req.headers.cookie)
}

/**
 * Returns the value of the specified cookie.
 * 
 * @param req 
 * @param name
 */
export function getCookie(req: IncomingMessage, name: string): string {
    if(getCookies(req)[name] === undefined) return ""

    return getCookies(req)[name]
}

/**
 * Creates a cookie.
 * 
 * Warning: this function adds a header in the response, so you need to assign the new headers on your response.
 * 
 * E.g: `response.headers = setCookie(resHeaders, cookie)`
 * 
 * @param responseHeaders 
 * @param {Cookie} cookie
 */
export function setCookie(responseHeaders: any, cookie: Cookie) {
    let cookieHeader = `${cookie.name}=${cookie.value}`
    if (cookie.domain) {
        cookieHeader += `; Domain=${cookie.domain}`
    }
    if (cookie.expires) {
        cookieHeader += `; Expires=${cookie.expires}`
    }
    if (cookie.httpOnly) {
        cookieHeader += '; HttpOnly'
    }
    if (cookie.maxAge) {
        cookieHeader += `; Max-Age=${cookie.maxAge}`
    }
    if (cookie.partitioned) {
        cookieHeader += '; Partitioned'
    }
    if (cookie.path) {
        cookieHeader += `; Path=${cookie.path}`
    }
    if (cookie.secure) {
        cookieHeader += '; Secure'
    }
    if (cookie.sameSite) {
        cookieHeader += `; SameSite=${cookie.sameSite}`
    }

    responseHeaders['Set-Cookie'] = cookieHeader

    return responseHeaders
}

/**
 * Deletes a cookie.
 * 
 * Warning: this function adds a header in the response, so you need to assign the new headers on your response.
 * 
 * E.g: `response.headers = deleteCookie(resHeaders, cookieName)`
 * 
 * @param responseHeaders 
 * @param name
 */
export function deleteCookie(responseHeaders: any, name: string) {
    responseHeaders["Set-Cookie"] = `${name}=goodbye; Expires=Wed, 21 Oct 2015 07:28:00 GMT`
    return responseHeaders
}
