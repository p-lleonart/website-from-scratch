import { Response } from "./response"
import { parseCookieData } from "./helpers"
import { Request } from "./request"
import { Cookie } from "./types"


export class CookieHandler {
    constructor(private request: Request) {
    }

    /**
     * Returns an object containing all cookies names with their values.
     */
    public getCookies(): {[key: string]: string} {
        return parseCookieData(this.request.headers.cookie)
    }

    /**
     * Returns the value of the specified cookie.
     * 
     * @param name
     */
    public getCookie(name: string): string {
        const cookie = this.getCookies()[name]
        if(cookie === undefined) return ""

        return cookie
    }

    /**
     * Creates a cookie.
     * 
     * Warning: this function adds a header in the response, so you need to assign the new headers on your response.
     * 
     * E.g: `response = request.cookieHandler.setCookie(response, cookie)`
     * 
     * @param response 
     * @param {Cookie} cookie
     */
    public setCookie(response: Response, cookie: Cookie) {
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

        response.setHeader('Set-Cookie', cookieHeader)

        return response
    }

    /**
     * Deletes a cookie.
     * 
     * Warning: this function adds a header in the response, so you need to assign the new headers on your response.
     * 
     * E.g: `response = request.cookieHandler.deleteCookie(response, cookieName)`
     * 
     * @param response
     * @param name
     */
    public deleteCookie(response: Response, name: string) {
        response.setHeader("Set-Cookie", `${name}=goodbye; Expires=Wed, 21 Oct 2015 07:28:00 GMT`)
        return response
    }
}
