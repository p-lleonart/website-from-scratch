import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"
import { HttpContext } from "./types"


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

    static async notFound({ response }: HttpContext) {
        return response.setResponse({
            body: await ErrorsController.getTemplateProcess(404, "<h3>404: Not Found</h3>"),
            contentType: "text/html",
            statusCode: 404
        })
    }
    
    static async serverError({ response }: HttpContext, options: {errorMessage: string}) {
        return response.setResponse({
            body: await ErrorsController.getTemplateProcess(500, `<h3>500: Internal server error</h3><pre>${options.errorMessage}</pre>`),
            contentType: "text/html",
            statusCode: 500
        })
    }
}
