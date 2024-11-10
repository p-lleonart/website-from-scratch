import { AUTH_ROUTES } from "./controllers/users"
import { readFile } from "fs/promises"
import { TestMiddleware, Test2Middleware, Test3Middleware, Test4Middleware } from "./middlewares/test"
import { HttpContext, Route } from "#root/types"


export const ROUTES: {[key: string]: Route} = {
    "GET:/": {
        callback: async ({ response }: HttpContext) => {
            return response.setResponse({
                contentType: "text/html",
                body: await readFile("./src/templates/index.html", "utf8")
            })
        }
    },
    "GET:/about": { controller: ["CoreController", "about"] },
    "GET:/contact": { controller: ["ContactController", "view"] },
    "POST:/contact": { controller: ["ContactController", "store"] },

    "GET:/posts": { controller: ["PostController", "getAll"] },
    // using searchParams
    "GET:/posts/view": {
        controller: ["PostController", "get"],
        middlewares: [
            new TestMiddleware(),
            new Test2Middleware()
        ]
    },
    "GET:/posts/create": { controller: ["PostController", "create"] },
    "POST:/posts/create": { controller: ["PostController", "store"] },
    "GET:/posts/edit": { controller: ["PostController", "editView"] },
    "POST:/posts/edit": { controller: ["PostController", "edit"] },
    "POST:/posts/delete": { controller: ["PostController", "delete"] },

    "GET:/dashboard": {
        callback: async ({ response }: HttpContext) => {
            return response.setResponse({
                contentType: "application/json",
                body: JSON.stringify({msg: "Welcome on your dashboard!"})
            })
        },
        middlewares: [new Test3Middleware()]
    },
    "GET:/dashboard/v2": {
        callback: async ({ response }: HttpContext) => {
            return response.setResponse({
                contentType: "application/json",
                body: JSON.stringify({msg: "Welcome on your dashboard v2!"})
            })
        },
        middlewares: [new Test4Middleware()]
    },
    ...AUTH_ROUTES,

    // TEST FOR ROUTING PARAMS
    "GET:/hello": {
        callback: async ({ response }: HttpContext) => {
            return response.setResponse({
                contentType: "text/html",
                body: `Hello index`
            })
        }
    },
    "GET:/hello/contact": {
        callback: async ({ response }: HttpContext) => {
            return response.setResponse({
                contentType: "text/html",
                body: `Hello contact 2`
            })
        }
    },
    "GET:/hello/:name": {
        callback: async ({ request, response }: HttpContext) => {
            return response.setResponse({
                contentType: "text/html",
                body: `Hello ${request.params.name}`
            })
        }
    },
    "GET:/hello/:name/then/:hi": {
        callback: async ({ request, response }: HttpContext) => {
            return response.setResponse({
                contentType: "text/html",
                body: `Hello ${request.params.name} ${request.params.hi}`
            })
        }
    },

    // TEST FOR DI
    "GET:/testdi": { controller: ["TestDIController", "myView"] },
    "GET:/testdi2": { controller: ["TestDI2Controller", "myView"] },
}