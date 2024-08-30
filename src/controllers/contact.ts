import { readFile } from "fs/promises"

import { getCookie, setCookie } from "../cookies"
import { getPostBody } from "../helpers/http"
import { IncomingMessage } from "http"
import { render } from "../helpers/http"
import { Response } from "../types"


export class ContactController {
    static async view(req: IncomingMessage, response: Response): Promise<Response> {
        return render(response, {
            contentType: "text/html",
            body: await readFile("./src/templates/contact.html", "utf8")
        })
    }

    static async store(req: IncomingMessage, response: Response): Promise<Response> {
        const message = await getPostBody(req)
        
        console.log(`message received (from ${message.name}): ${message.content}`)

        const cookie = getCookie(req, "MessagesSent")
        const messagesSent = cookie
            ? parseInt(cookie, 10)
            : 0

        response.headers = setCookie(response.headers, {
            name: "MessagesSent",
            value: `${messagesSent + 1}`
        })

        return render(response, {
            contentType: "text/html",
            body: await readFile("./src/templates/contact-thanks.html", "utf8"),
            statusCode: 201  // 201 - Created
        })
    }
}
