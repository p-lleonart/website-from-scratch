import { IncomingMessage } from "http"
import { readFile } from "fs/promises"

import { ContactController } from "./controllers/contact"
import { CoreController } from "./controllers/core"
import { setResponse } from "./helpers/http"
import { Response, Route } from "./types"


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
    }
}