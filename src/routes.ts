import { IncomingMessage } from "http"
import { readFile } from "fs/promises"

import { AUTH_ROUTES } from "./controllers/users"
import { ContactController } from "./controllers/contact"
import { CoreController } from "./controllers/core"
import { PostController } from "./controllers/posts"
import { setResponse } from "./helpers"
import { Response, Route } from "./types"
import { TestMiddleware, Test2Middleware, Test3Middleware } from "./middlewares/test"


export const ROUTES: {[key: string]: Route} = {
    "GET:/": {
        callback: async (req: IncomingMessage, response: Response) => {
            return setResponse(response, {
                contentType: "text/html",
                body: await readFile("./src/templates/index.html", "utf8")
            })
        }
    },
    "GET:/about": {
        callback: async (req: IncomingMessage, response: Response) => CoreController.about(req, response)
    },
    "GET:/contact": {
        callback: async (req: IncomingMessage, response: Response) => ContactController.view(req, response)
    },
    "POST:/contact": {
        callback: async (req: IncomingMessage, response: Response) => ContactController.store(req, response)
    },

    "GET:/posts": {
        callback: async (req: IncomingMessage, response: Response) => PostController.getAll(req, response)
    },
    // formatted routes aren't implemented yet, for now on, we'll use searchParams
    "GET:/posts/view": {
        callback: async (req: IncomingMessage, response: Response) => PostController.get(req, response),
        middlewares: [
            new TestMiddleware(),
            new Test2Middleware()
        ]
    },
    "GET:/posts/create": {
        callback: async (req: IncomingMessage, response: Response) => PostController.create(req, response)
    },
    "POST:/posts/create": {
        callback: async (req: IncomingMessage, response: Response) => PostController.store(req, response)
    },
    "GET:/posts/edit": {
        callback: async (req: IncomingMessage, response: Response) => PostController.editView(req, response)
    },
    "POST:/posts/edit": {
        callback: async (req: IncomingMessage, response: Response) => PostController.edit(req, response)
    },
    "POST:/posts/delete": {
        callback: async (req: IncomingMessage, response: Response) => PostController.delete(req, response)
    },
    "GET:/dashboard": {
        callback: async (req: IncomingMessage, response: Response) => {
            return setResponse(response, {
                contentType: "application/json",
                body: JSON.stringify({msg: "Welcome on your dashboard!"})
            })
        },
        middlewares: [new Test3Middleware()]
    },
    ...AUTH_ROUTES
}