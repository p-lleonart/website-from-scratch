import { getPostBody } from "../helpers/http"
import { AuthMiddleware, User } from "../modules/auth"
import { ModelObject } from "../modules/database/types"
import { render } from "../modules/template-parser"
import { HttpContext, Route } from "../types"

export const AUTH_ROUTES: {[key: string]: Route} = {
    "GET:/users/login": {
        callback: async (httpContext: HttpContext) => UserController.login(httpContext)
    },
    "POST:/users/login": {
        callback: async (httpContext: HttpContext) => UserController.processLogin(httpContext)
    },
    "GET:/users/signup": {
        callback: async (httpContext: HttpContext) => UserController.signup(httpContext)
    },
    "POST:/users/signup": {
        callback: async (httpContext: HttpContext) => UserController.processSignup(httpContext)
    },
    "POST:/users/logout": {
        callback: async (httpContext: HttpContext) => UserController.processLogout(httpContext),
        middlewares: [new AuthMiddleware()]
    },
    "GET:/users/dashboard": {
        callback: async (httpContext: HttpContext) => UserController.dashboard(httpContext),
        middlewares: [new AuthMiddleware()]
    }
}

export class UserController {
    public static async login({ response }: HttpContext) {
        return response.setResponse({
            contentType: "text/html",
            body: render("./src/templates/users/login.html")
        })
    }

    public static async processLogin({ req, response }: HttpContext) {
        const body = await getPostBody(req)
        let user: ModelObject | null

        if (!body || !body.email || !body.password) {
            return response.setResponse({
                contentType: "text/html",
                statusCode: 422,
                body: render("./src/templates/users/login.html", {
                    error: "Email or password missing"
                })
            })
        }

        try {
            user = await User.verifyCrendentials(body.email, body.password)
        } catch (err: any) {
            return response.setResponse({
                contentType: "text/html",
                statusCode: 400,
                body: render("./src/templates/users/login.html", {
                    error: err.message
                })
            })
        }

        if (user) {
            response = await User.login(response, user)
            return response.redirect("/users/dashboard")
        }

        return response.setResponse({
            contentType: "text/html",
            statusCode: 401,
            body: render("./src/templates/users/login.html", {
                error: "Wrong email or are password"
            })
        })
    }

    public static async signup({ response }: HttpContext) {
        return response.setResponse({
            contentType: "text/html",
            body: render("./src/templates/users/signup.html")
        })
    }

    public static async processSignup({ req, response }: HttpContext) {
        const body = await getPostBody(req)
        let user: ModelObject | null

        if (!body || !body.name || !body.email || !body.password) {
            return response.setResponse({
                contentType: "text/html",
                statusCode: 422,
                body: render("./src/templates/users/signup.html", {
                    error: "Name, email or password are missing"
                })
            })
        }

        try {
            user = await User.create({ name: body.name, email: body.email, password: body.password})
        } catch (err: any) {
            return response.setResponse({
                contentType: "text/html",
                statusCode: 400,
                body: render("./src/templates/users/signup.html", {
                    error: err.message
                })
            })
        }

        response = await User.login(response, user)
        return response.redirect("/users/dashboard")
    }

    public static async processLogout({ req, response }: HttpContext) {
        const user = await User.getCurrentUser(req)
        response = await User.logout(response, user!)  // user exists in all cases thanks to the middleware
        return response.redirect("/users/login")
    }

    public static async dashboard({ req, response }: HttpContext) {
        const user = await User.getCurrentUser(req)
        
        return response.setResponse({
            contentType: "text/html",
            body: render("./src/templates/users/dashboard.html", user!)
        })
    }
}
