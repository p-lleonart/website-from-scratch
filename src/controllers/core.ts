import { IncomingMessage } from "http"

import { render } from "../helpers/http"
import { Response } from "../types"


export class CoreController {
    static async about(req: IncomingMessage, response: Response): Promise<Response> {
        return render(response, {
            contentType: "text/html",
            body: "<h1>About</h1>"
        })
    }
}
