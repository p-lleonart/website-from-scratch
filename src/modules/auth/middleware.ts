import { env } from "../../env"
import { deleteCookie } from "../../helpers"
import { Middleware } from "../../middleware"
import { User } from "./models/user"
import { HttpContext } from "../../types"


const AUTH_TOKEN_COOKIE_NAME = env.AUTH_TOKEN_COOKIE_NAME
    ? env.AUTH_TOKEN_COOKIE_NAME
    : "auth_token"

export class AuthMiddleware extends Middleware {
    public async handle({ req, response }: HttpContext) {
        const user = await User.getCurrentUser(req)

        if (!user) {
            response.setHeaders(deleteCookie(response.getHeaders(), AUTH_TOKEN_COOKIE_NAME))
            response.setStatusCode(403)
            return {
                mReq: req,
                mResponse: response.redirect("/users/login?loginRequired"),
                returnResponse: true
            }
        }

        return { mReq: req, mResponse: response, returnResponse: false}
    }
}
