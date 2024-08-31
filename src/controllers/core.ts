import { IncomingMessage } from "http"

import { setResponse } from "../helpers/http"
import { Response } from "../types"


export class CoreController {
    static async about(req: IncomingMessage, response: Response): Promise<Response> {
        return setResponse(response, {
            contentType: "text/html",
            body: "<h1>About</h1>"
        })
    }
}
