import { generateToken, setCsrfCookie } from "./helpers"
import { Request, Response } from "#lib/http"
import { CsrfMiddleware } from "./middleware"
import { env } from "#root/env"
import { HttpContext } from "#root/types"


declare module "#lib/http" {
    interface Response {
        generateCsrfToken: (request: Request) => string
        setCsrfCookie: (HttpContext: HttpContext, token: string) => Response
        csrfHTMLInput: (token: string) => string
    }
}

Response.prototype.generateCsrfToken = function (request: Request) {
    const session_id = request.cookieHandler.getCookie(env.SESSION_ID_COOKIE_NAME)
    return generateToken(session_id)
}

Response.prototype.setCsrfCookie = function (httpContext: HttpContext, token: string) {
    return setCsrfCookie(httpContext, token)
}

Response.prototype.csrfHTMLInput = function (token: string) {
    return `<input name="${env.CSRF_TOKEN_BODY_FIELD_NAME}" type="hidden" value="${token}" />`
}

export {
    CsrfMiddleware,
    generateToken,
    setCsrfCookie,
}
