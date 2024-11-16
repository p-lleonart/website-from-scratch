import { CONFIG } from "#app/config"
import { generateToken, setCsrfCookie } from "./helpers"
import { Request, Response } from "#lib/http"
import { CsrfMiddleware } from "./middleware"
import { HttpContext, ModuleConfig } from "#root/types"


declare module "#lib/http" {
    interface Response {
        generateCsrfToken: (request: Request) => string
        setCsrfCookie: (HttpContext: HttpContext, token: string) => Response
        csrfHTMLInput: (token: string) => string
    }
}

Response.prototype.generateCsrfToken = function (request: Request) {
    const session_id = request.cookieHandler.getCookie(CONFIG.modules.sessions.ID_COOKIE_NAME)
    return generateToken(session_id)
}

Response.prototype.setCsrfCookie = function (httpContext: HttpContext, token: string) {
    return setCsrfCookie(httpContext, token)
}

Response.prototype.csrfHTMLInput = function (token: string) {
    return `<input name="${CONFIG.modules.csrfShield.TOKEN_BODY_NAME}" type="hidden" value="${token}" />`
}

type CsrfShieldConfig = ModuleConfig & {
    TOKEN_COOKIE_NAME: string
    TOKEN_HEADER_NAME: string
    TOKEN_BODY_NAME: string
    TOKEN_EXPIRES: number
}

export {
    CsrfMiddleware,
    CsrfShieldConfig,
    generateToken,
    setCsrfCookie,
}
