import { BaseController } from "#lib/ioc"
import { getFileFormat, getFileFromTmp } from "#helpers"
import { HttpContext } from "#root/types"
import { render } from "#template-parser"


export class FileTestController extends BaseController {
    public async upload({ response }: HttpContext) {
        return response.setResponse({
            contentType: "text/html",
            body: render("./src/templates/file.html")
        })
    }

    public async store({ request, response }: HttpContext) {
        console.log(request.body, request.files)

        for (const file of Object.keys(request.files)) {
            console.log(request.files[file]?.map(f => `${f.originalFilename} -> ${f.newFilename}`))

            /**
             * You could decide to move this file in another place than in `tmp/uploads`...
             */
            // move(`tmp/uploads/${request.files[file]?.[0].newFilename!}`, "storage/uploads")
        }

        return response.setResponse({
            contentType: "application/json",
            body: JSON.stringify(request.body)
        })
    }

    public async view({ request, response }: HttpContext) {
        try {
            const fileContent = await getFileFromTmp(request.params.id)
            return response.setResponse({
                contentType: await getFileFormat(request.params.id),
                body: fileContent
            })
        } catch (e: any) {
            return response.setErrorResponse({
                statusCode: 404,
                statusMessage: `404: Not found, the requested resource (${request.params.id}) doesn't exists`,
            })
        }
    }
}
