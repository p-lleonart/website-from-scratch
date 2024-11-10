import { getSessionId } from "#helpers"
import { generateToken } from "./helpers"
import { env } from "#root/env"
import { Middleware } from "#root/middleware"
import { HttpContext } from "#root/types"


export class CsrfMiddleware extends Middleware {
    public async handle(httpContext: HttpContext): Promise<HttpContext> {
        const sessionId = getSessionId(httpContext.request)
        const reqCookieToken = httpContext.request.cookieHandler.getCookie(env.CSRF_TOKEN_COOKIE_NAME)

        /** the second token could be in the body or in a header */
        const reqBodyToken = httpContext.request.body[env.CSRF_TOKEN_BODY_FIELD_NAME]
            ?? httpContext.request.headers[env.CSRF_TOKEN_HEADER_NAME]

        if (!reqBodyToken || !reqCookieToken) return this.formatOutputHttpContext(httpContext)

        const expectedToken = generateToken(sessionId)

        if (reqBodyToken === expectedToken && reqCookieToken === expectedToken) {
            return super.handle(httpContext)
        }

        return this.formatOutputHttpContext(httpContext)
    }

    private formatOutputHttpContext(httpContext: HttpContext) {
        return {
            req: httpContext.req,
            request: httpContext.request,
            response: httpContext.response.setErrorResponse({ statusCode: 403, statusMessage: "Page expired" })
        }
    }
}
