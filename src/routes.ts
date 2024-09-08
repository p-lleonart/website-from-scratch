import { IncomingMessage } from "http"
import { readFile } from "fs/promises"

import { ContactController } from "./controllers/contact"
import { CoreController } from "./controllers/core"
import { setResponse } from "./helpers/http"
import { Response, Route } from "./types"
import { PostController } from "./controllers/posts"


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
        callback: async (req: IncomingMessage, response: Response) => PostController.get(req, response)
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
    }
}