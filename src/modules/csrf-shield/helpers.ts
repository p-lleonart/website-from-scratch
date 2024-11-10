import { createHmac } from "crypto"
import { Response } from "#lib/http"
import { env } from "#root/env"
import { HttpContext } from "#root/types"


export function generateToken(sessionId: string) {
    return createHmac('sha256', env.SECRET_KEY).update(sessionId).digest('hex')
}

export function setCsrfCookie({ request, response }: HttpContext, token: string): Response {
    return request.cookieHandler.setCookie(response, {
        name: env.CSRF_TOKEN_COOKIE_NAME,
        value: token,
        secure: true,
        sameSite: "Strict",
        httpOnly: true,
        maxAge: parseInt(env.CSRF_TOKEN_EXPIRES)
    })
}
