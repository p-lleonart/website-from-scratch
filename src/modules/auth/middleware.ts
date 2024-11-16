import { CONFIG } from "#app/config"
import { Middleware } from "#root/middleware"
import { User } from "./models/user"
import { HttpContext } from "#root/types"


export class AuthMiddleware extends Middleware {
    public async handle({ req, request, response}: HttpContext) {
        const user = await User.getCurrentUser(request)

        if (!user) {
            response = request.cookieHandler.deleteCookie(response, CONFIG.modules.auth.TOKEN_COOKIE_NAME)
            response = response.redirect("/users/login?loginRequired")
            return { req, request, response }
        }

        return super.handle({ req, request, response })
    }
}
