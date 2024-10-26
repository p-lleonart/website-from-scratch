import AddCsrfTokenMigration from "./migrations/add_csrf_tokens"
import CsrfToken from "./models/csrf-token"
import CsrfValidationMiddleware from "./middlewares/csrf-validation"
import { Response } from "@/response"


declare module "@/response" {
    interface Response {
        generateCsrfToken(): Promise<CsrfToken>
    }
}

Response.prototype.generateCsrfToken = async function () {
    const csrfToken = await CsrfToken.create() as CsrfToken

    this.setHeader("X-request-id", csrfToken.id.toString())

    return csrfToken
}

export {
    AddCsrfTokenMigration,
    CsrfToken,
    CsrfValidationMiddleware
}