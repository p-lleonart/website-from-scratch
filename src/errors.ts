import { existsSync } from "node:fs"
import { IncomingMessage } from "http"
import { readFile } from "node:fs/promises"

import { Response } from "./types"


export class ErrorsController {
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

    static async notFound(req: IncomingMessage, response: Response): Promise<Response> {
        response.statusCode = 404
        response.headers['Content-Type'] = "text/html"        
        response.body = await ErrorsController.getTemplateProcess(404, "<h3>404: Not Found</h3>")
        return response
    }
    
    static async serverError(req: IncomingMessage, response: Response, options: {errorMessage: string}): Promise<Response> {
        response.statusCode = 500
        response.headers['Content-Type'] = "text/html"
        response.body = await ErrorsController.getTemplateProcess(500, `<h3>500: Internal server error</h3><pre>${options.errorMessage}</pre>`)
        return response
    }
}
