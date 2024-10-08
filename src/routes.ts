import { CoreController } from "./controllers/core"
import { ContactController } from "./controllers/contact"
import { PostController } from "./controllers/posts"
import { AUTH_ROUTES } from "./controllers/users"
import { readFile } from "fs/promises"
import { TestMiddleware, Test2Middleware, Test3Middleware } from "./middlewares/test"
import { HttpContext, Route } from "./types"


export const ROUTES: {[key: string]: Route} = {
    "GET:/": {
        callback: async ({ response }: HttpContext) => {
            return response.setResponse({
                contentType: "text/html",
                body: await readFile("./src/templates/index.html", "utf8")
            })
        }
    },
    "GET:/about": {
        callback: async (httpContext: HttpContext) => CoreController.about(httpContext)
    },
    "GET:/contact": {
        callback: async (httpContext: HttpContext) => ContactController.view(httpContext)
    },
    "POST:/contact": {
        callback: async (httpContext: HttpContext) => ContactController.store(httpContext)
    },

    "GET:/posts": {
        callback: async (httpContext: HttpContext) => PostController.getAll(httpContext)
    },
    // formatted routes aren't implemented yet, for now on, we'll use searchParams
    "GET:/posts/view": {
        callback: async (httpContext: HttpContext) => PostController.get(httpContext),
        middlewares: [
            new TestMiddleware(),
            new Test2Middleware()
        ]
    },
    "GET:/posts/create": {
        callback: async (httpContext: HttpContext) => PostController.create(httpContext)
    },
    "POST:/posts/create": {
        callback: async (httpContext: HttpContext) => PostController.store(httpContext)
    },
    "GET:/posts/edit": {
        callback: async (httpContext: HttpContext) => PostController.editView(httpContext)
    },
    "POST:/posts/edit": {
        callback: async (httpContext: HttpContext) => PostController.edit(httpContext)
    },
    "POST:/posts/delete": {
        callback: async (httpContext: HttpContext) => PostController.delete(httpContext)
    },
    "GET:/dashboard": {
        callback: async ({ response }: HttpContext) => {
            return response.setResponse({
                contentType: "application/json",
                body: JSON.stringify({msg: "Welcome on your dashboard!"})
            })
        },
        middlewares: [new Test3Middleware()]
    },
    ...AUTH_ROUTES
}