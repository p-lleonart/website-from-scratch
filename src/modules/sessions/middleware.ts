import { setSessionIdCookie } from "./helpers"
import { Middleware } from "#root/middleware"
import { HttpContext } from "#root/types"


export class SessionMiddleware extends Middleware {
    public async handle(httpContext: HttpContext): Promise<HttpContext> {
        const sessionId = httpContext.request.cookieHandler.getCookie("session_id")
        if (!sessionId) {
            httpContext.response = setSessionIdCookie(httpContext)
        }

        return super.handle(httpContext)
    }
}
