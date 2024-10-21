import { env } from "@/env"
import { Middleware } from "@/middleware"
import { User } from "./models/user"
import { HttpContext } from "@/types"


export class AuthMiddleware extends Middleware {
    public async handle({ req, request, response}: HttpContext) {
        const user = await User.getCurrentUser(request)

        if (!user) {
            response = request.cookieHandler.deleteCookie(response, env.AUTH_TOKEN_COOKIE_NAME)
            response.statusCode = 403
            return {
                httpContext: {
                    req,
                    request,
                    response: response.redirect("/users/login?loginRequired"),
                },
                returnResponse: true
            }
        }

        return { httpContext: { req, request, response }, returnResponse: false}
    }
}
