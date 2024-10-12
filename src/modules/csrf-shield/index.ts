import { ModelObject } from "../database"
import AddCsrfTokenMigration from "./migrations/add_csrf_tokens"
import CsrfToken from "./models/csrf-token"
import CsrfValidationMiddleware from "./middlewares/csrf-validation"
import { Response } from "@/response"


declare module "@/response" {
    interface Response {
        generateCsrfToken(): Promise<ModelObject>
        csrfInput(csrfToken: ModelObject): string
    }
}

Response.prototype.generateCsrfToken = async function () {
    const csrfToken = await CsrfToken.create()

    this.setHeader("X-request-id", csrfToken.id.toString())

    return csrfToken
}

Response.prototype.csrfInput = function (csrfToken: ModelObject) {
    return `<input name="_token" type="hidden" value="${csrfToken.token}" />
        <input name="_reqId" type="hidden" value="${csrfToken.id}" />`
}


export {
    AddCsrfTokenMigration,
    CsrfToken,
    CsrfValidationMiddleware
}