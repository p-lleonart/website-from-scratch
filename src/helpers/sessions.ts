import { randomBytes } from "crypto"
import { Request } from "#lib/http"
import { env } from "#root/env"
import { HttpContext } from "#root/types"


export function getSessionId(request: Request) {
    let sessionId = request.cookieHandler.getCookie(env.SESSION_ID_COOKIE_NAME)

    if (!sessionId) sessionId = randomBytes(parseInt(env.SESSION_ID_LENGTH)).toString('hex')
    
    return sessionId
}

export function setSessionIdCookie({ request, response }: HttpContext) {
    return request.cookieHandler.setCookie(response, {
        name: env.SESSION_ID_COOKIE_NAME,
        value: getSessionId(request),
        secure: true,
        sameSite: "Strict",
        httpOnly: true,
        maxAge: parseInt(env.SESSION_ID_COOKIE_EXPIRES, 10),
        path: '/'
    })
}
