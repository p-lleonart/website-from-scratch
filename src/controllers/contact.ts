import { getCookie, getPostBody, setCookie } from "../helpers"
import { render } from "../template-parser"
import { HttpContext } from "../types"


export class ContactController {
    static async view({ response }: HttpContext) {
        return response.setResponse({
            contentType: "text/html",
            body: render("./src/templates/contact.html", {
                name: "john doe",
                message: "hello, world!",
                messangesSent: 3,
                msgs: ["hi", "hi1", "hi2"]
            })
        })
    }

    static async store({ req, response }: HttpContext) {
        const message = await getPostBody(req)
        
        console.info(`message received (from ${message.name}): ${message.content}`)

        const cookie = getCookie(req, "MessagesSent")
        const messagesSent = cookie
            ? parseInt(cookie, 10)
            : 0

        response.setHeaders(setCookie(response.getHeaders(), {
            name: "MessagesSent",
            value: `${messagesSent + 1}`
        }))

        return response.setResponse({
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
