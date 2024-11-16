import { CONFIG } from "#app/config"
import { randomBytes } from "crypto"
import { Request } from "#lib/http"
import { HttpContext } from "#root/types"


export function getSessionId(request: Request) {
    let sessionId = request.cookieHandler.getCookie(CONFIG.modules.sessions.ID_COOKIE_NAME)

    if (!sessionId) sessionId = randomBytes(CONFIG.modules.sessions.ID_LENGTH).toString('hex')
    
    return sessionId
}

export function setSessionIdCookie({ request, response }: HttpContext) {
    return request.cookieHandler.setCookie(response, {
        name: CONFIG.modules.sessions.ID_COOKIE_NAME,
        value: getSessionId(request),
        secure: true,
        sameSite: "Strict",
        httpOnly: true,
        maxAge: CONFIG.modules.sessions.ID_COOKIE_EXPIRES,
        path: '/'
    })
}
