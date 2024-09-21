import { IncomingMessage } from "http"

import { getCookie, getPostBody, setCookie, setResponse } from "../helpers"
import { Response } from "../types"
import { render } from "../template-parser"


export class ContactController {
    static async view(req: IncomingMessage, response: Response): Promise<Response> {
        return setResponse(response, {
            contentType: "text/html",
            body: render("./src/templates/contact.html", {
                name: "john doe",
                message: "hello, world!",
                messangesSent: 3,
                msgs: ["hi", "hi1", "hi2"]
            })
        })
    }

    static async store(req: IncomingMessage, response: Response): Promise<Response> {
        const message = await getPostBody(req)
        
        console.info(`message received (from ${message.name}): ${message.content}`)

        const cookie = getCookie(req, "MessagesSent")
        const messagesSent = cookie
            ? parseInt(cookie, 10)
            : 0

        response.headers = setCookie(response.headers, {
            name: "MessagesSent",
            value: `${messagesSent + 1}`
        })

        return setResponse(response, {
            contentType: "text/html",
            body: render('./src/templates/contact-thanks.html', {
                name: message.name,
                message: message.content,
                messagesSent: messagesSent + 1,
                isMessagesSentGreaterThan3: messagesSent + 1 > 3
            }),
            statusCode: 201  // 201 - Created
        })
    }
}
