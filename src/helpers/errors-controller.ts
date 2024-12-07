import { CONFIG } from "#app/config"
import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"
import BaseController from "#lib/ioc/base-controller"
import { HttpContext } from "#root/types"


export class ErrorsController extends BaseController {
    /**
     * It permits to the server to see if the user customized the template for a specific HTTP error.
     * 
     * To customize an error template, you have to create a `./templates/errors/{statusCode}.html`.
     * 
     * @param {number} statusCode 
     * @returns {string | undefined} ``undefined`` if the template wasn't configured.
     */
    private static async getCustomErrorTemplate(statusCode: number): Promise<string | undefined> {
        const path = `./templates/errors/${statusCode}.html`

        if(existsSync(path)) return await readFile(path, 'utf8')
        
        return undefined
    }

    /**
     * 
     */
    private static async getTemplateProcess(statusCode: number, defaultTemplate: string) {
        const customTemplate = await ErrorsController.getCustomErrorTemplate(statusCode)
        return customTemplate ? customTemplate : defaultTemplate
    }

    public async notFound({ response }: HttpContext) {
        return response.setResponse({
            body: await ErrorsController.getTemplateProcess(404, "<h3>404: Not Found</h3>"),
            contentType: "text/html",
            statusCode: 404
        })
    }
    
    public async serverError({ response }: HttpContext, options: { name: string, message: string, stack: string }) {
        const template = CONFIG.NODE_ENV === "dev" || CONFIG.NODE_ENV === "test"
            ? `<h3>500: Internal server error</h3><pre>name: ${options.name}<br>msg: ${options.message}<br>stack: ${options.stack}</pre>`
            : "<h3>500: Internal server error</h3>"

        return response.setResponse({
            body: await ErrorsController.getTemplateProcess(500, template),
            contentType: "text/html",
            statusCode: 500
        })
    }

    public async badRequest({ response }: HttpContext, options: { message: string }) {
        return response.setResponse({
            body: await ErrorsController.getTemplateProcess(500, `<h3>400: bad request</h3><p>Your request is invalid : ${options.message}</p>`),
            contentType: "text/html",
            statusCode: 400
        }) 
    }
}
