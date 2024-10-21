import { AuthMiddleware, User } from "@auth"
import { CsrfValidationMiddleware } from "@csrf-shield"
import { ModelObject } from "@database"
import { render } from "@template-parser"
import { Schema } from "@validator"
import type { LoginPayload, SignupPayload } from "./types"
import type { HttpContext, Route } from "@/types"

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
        callback: async (httpContext: HttpContext) => UserController.processSignup(httpContext),
        middlewares: [new CsrfValidationMiddleware()]
    },
    "POST:/users/logout": {
        callback: async (httpContext: HttpContext) => UserController.processLogout(httpContext),
        middlewares: [new AuthMiddleware()]
    },
    "GET:/users/dashboard": {
        callback: async (httpContext: HttpContext) => UserController.dashboard(httpContext),
        middlewares: [new AuthMiddleware()],
        description: "This is the dashboard that permits to the user to access to their data. It requires a login to access to it."
    }
}

export class UserController {
    public static async login({ response }: HttpContext) {
        return response.setResponse({
            contentType: "text/html",
            body: render("./src/templates/users/login.html")
        })
    }

    public static async processLogin({ request, response }: HttpContext) {
        const schema = await Schema.create({
            email: {
                "email": []
            },
            password: {
                "min": [8]
            }
        })
        const body = await schema.parse<LoginPayload>(request.body)
        let user: ModelObject | null

        if (!body.success) {
            return response.setResponse({
                contentType: "text/html",
                statusCode: 422,
                body: render("./src/templates/users/login.html", {
                    error: Object.values(body.data).join("\n")
                })
            })
        }

        try {
            user = await User.verifyCrendentials(body.data.email, body.data.password)
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
            response = await User.login({ request, response }, user)
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
        const csrfToken = await response.generateCsrfToken()

        return response.setResponse({
            contentType: "text/html",
            body: render("./src/templates/users/signup.html", {
                csrfInput: response.csrfInput(csrfToken)
            })
        })
    }

    public static async processSignup({ request, response }: HttpContext) {
        const schema = await Schema.create({
            name: {
                "optional": ["John Doe"]  // you can set a default value
            },
            email: {
                "email": []
            },
            password: {
                "myCustomMin": []  // OR "min": [8] (built-in)
            }
        })
        const body = await schema.parse<SignupPayload>(request.body)
        let user: ModelObject | null

        if (!body.success) {
            return response.setResponse({
                contentType: "text/html",
                statusCode: 422,
                body: render("./src/templates/users/signup.html", {
                    error: Object.values(body.data).join("\n")
                })
            })
        }

        try {
            user = await User.create({
                name: body.data.name,
                email: body.data.email,
                password: body.data.password
            })
        } catch (err: any) {
            return response.setResponse({
                contentType: "text/html",
                statusCode: 400,
                body: render("./src/templates/users/signup.html", {
                    error: err.message
                })
            })
        }

        response = await User.login({ request, response }, user)
        return response.redirect("/users/dashboard")
    }

    public static async processLogout({ request, response }: HttpContext) {
        const user = await User.getCurrentUser(request)
        response = await User.logout({ request, response }, user!)  // user exists in all cases thanks to the middleware
        return response.redirect("/users/login")
    }

    public static async dashboard({ request, response }: HttpContext) {
        const user = await User.getCurrentUser(request)
        
        return response.setResponse({
            contentType: "text/html",
            body: render("./src/templates/users/dashboard.html", user!)
        })
    }
}
