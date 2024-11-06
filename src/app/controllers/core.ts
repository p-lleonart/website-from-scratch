import { HttpContext } from "#root/types"


export class CoreController {
    static async about({ response }: HttpContext) {
        return response.setResponse({
            contentType: "text/html",
            body: "<h1>About</h1>"
        })
    }
}
