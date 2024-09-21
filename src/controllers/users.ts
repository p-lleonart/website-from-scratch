import { AuthMiddleware, User } from "../auth"
import { ModelObject } from "../database/types"
import { getPostBody, redirect, setResponse } from "../helpers/http"
import { IncomingMessage } from "http"
import { render } from "../template-parser"
import { Response, Route } from "../types"

export const AUTH_ROUTES: {[key: string]: Route} = {
    "GET:/users/login": {
        callback: async (req: IncomingMessage, response: Response) => UserController.login(req, response)
    },
    "POST:/users/login": {
        callback: async (req: IncomingMessage, response: Response) => UserController.processLogin(req, response)
    },
    "GET:/users/signup": {
        callback: async (req: IncomingMessage, response: Response) => UserController.signup(req, response)
    },
    "POST:/users/signup": {
        callback: async (req: IncomingMessage, response: Response) => UserController.processSignup(req, response)
    },
    "POST:/users/logout": {
        callback: async (req: IncomingMessage, response: Response) => UserController.processLogout(req, response),
        middlewares: [new AuthMiddleware()]
    },
    "GET:/users/dashboard": {
        callback: async (req: IncomingMessage, response: Response) => UserController.dashboard(req, response),
        middlewares: [new AuthMiddleware()]
    }
}

export class UserController {
    public static async login(req: IncomingMessage, response: Response): Promise<Response> {
        return setResponse(response, {
            contentType: "text/html",
            body: render("./src/templates/users/login.html")
        })
    }

    public static async processLogin(req: IncomingMessage, response: Response): Promise<Response> {
        const body = await getPostBody(req)
        let user: ModelObject | null

        if (!body || !body.email || !body.password) {
            return setResponse(response, {
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
            return setResponse(response, {
                contentType: "text/html",
                statusCode: 400,
                body: render("./src/templates/users/login.html", {
                    error: err.message
                })
            })
        }

        if (user) {
            response = await User.login(response, user)
            return redirect(response, "/users/dashboard")
        }

        return setResponse(response, {
            contentType: "text/html",
            statusCode: 401,
            body: render("./src/templates/users/login.html", {
                error: "Wrong email or are password"
            })
        })
    }

    public static async signup(req: IncomingMessage, response: Response): Promise<Response> {
        return setResponse(response, {
            contentType: "text/html",
            body: render("./src/templates/users/signup.html")
        })
    }

    public static async processSignup(req: IncomingMessage, response: Response) {
        const body = await getPostBody(req)
        let user: ModelObject | null

        if (!body || !body.name || !body.email || !body.password) {
            return setResponse(response, {
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
            return setResponse(response, {
                contentType: "text/html",
                statusCode: 400,
                body: render("./src/templates/users/signup.html", {
                    error: err.message
                })
            })
        }

        response = await User.login(response, user)
        return redirect(response, "/users/dashboard")
    }

    public static async processLogout(req: IncomingMessage, response: Response) {
        const user = await User.getCurrentUser(req)
        response = await User.logout(response, user!)  // user exists in all cases thanks to the middleware
        return redirect(response, "/users/login")
    }

    public static async dashboard(req: IncomingMessage, response: Response) {
        const user = await User.getCurrentUser(req)
        
        return setResponse(response, {
            contentType: "text/html",
            body: render("./src/templates/users/dashboard.html", user!)
        })
    }
}
