import { render } from "#template-parser"
import { HttpContext } from "#root/types"


export class ContactController {
    static async view({ response }: HttpContext) {
        return response.setResponse({
            contentType: "text/html",
            body: render("./src/templates/contact.html", {
                name: "john doe",
                message: "hello, world!",
                messagesSent: 3,
                msgs: ["hi", "hi1", "hi2"]
            })
        })
    }

    static async store({ request, response }: HttpContext) {
        const message = request.body
        
        console.info(`message received (from ${message.name}): ${message.content}`)

        const cookie = request.cookieHandler.getCookie("MessagesSent")
        const messagesSent = cookie
            ? parseInt(cookie, 10)
            : 0

        response = request.cookieHandler.setCookie(response, {
            name: "MessagesSent",
            value: `${messagesSent + 1}`
        })

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
