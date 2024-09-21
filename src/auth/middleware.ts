import { env } from "../env"
import { IncomingMessage } from "http"
import { deleteCookie, redirect } from "../helpers"
import { Middleware } from "../middleware"
import { User } from "./models/user"
import { Response } from "../types"


const AUTH_TOKEN_COOKIE_NAME = env.AUTH_TOKEN_COOKIE_NAME
    ? env.AUTH_TOKEN_COOKIE_NAME
    : "auth_token"

export class AuthMiddleware extends Middleware {
    public async handle(req: IncomingMessage, response: Response) {
        const user = await User.getCurrentUser(req)

        if (!user) {
            response.headers = deleteCookie(response.headers, AUTH_TOKEN_COOKIE_NAME)
            response.statusCode = 403
            return {
                mReq: req,
                mResponse: redirect(response, "/users/login?loginRequired"),
                returnResponse: true
            }
        }

        return { mReq: req, mResponse: response, returnResponse: false}
    }
}
