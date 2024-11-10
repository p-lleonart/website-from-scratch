import { BaseController } from "#lib/ioc"
import { HttpContext } from "#root/types"


export class CoreController extends BaseController {
    public async about({ response }: HttpContext) {
        return response.setResponse({
            contentType: "text/html",
            body: "<h1>About</h1>"
        })
    }
}
