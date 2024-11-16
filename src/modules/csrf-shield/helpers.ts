import { CONFIG } from "#app/config"
import { createHmac } from "crypto"
import { Response } from "#lib/http"
import { HttpContext } from "#root/types"


export function generateToken(sessionId: string) {
    return createHmac('sha256', CONFIG.SECRET_KEY).update(sessionId).digest('hex')
}

export function setCsrfCookie({ request, response }: HttpContext, token: string): Response {
    return request.cookieHandler.setCookie(response, {
        name: CONFIG.modules.csrfShield.TOKEN_COOKIE_NAME,
        value: token,
        secure: true,
        sameSite: "Strict",
        httpOnly: true,
        maxAge: CONFIG.modules.csrfShield.TOKEN_COOKIE_EXPIRES
    })
}
