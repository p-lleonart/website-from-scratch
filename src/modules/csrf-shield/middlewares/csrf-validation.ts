import { Middleware } from "@/middleware"
import { HttpContext } from "@/types"
import CsrfToken from "@csrf-shield/models/csrf-token"

export default class CsrfValidationMiddleware extends Middleware {
    public async handle({ req, request, response }: HttpContext) {
        const reqId = request.getBody()._reqId
        const reqToken = request.getBody()._token

        if (reqId) {
            const csrfToken = await CsrfToken.find(reqId)

            if (csrfToken) {
                if (csrfToken.token === reqToken) {
                    await CsrfToken.destroy(csrfToken.id.toString())
                    return {mReq: req, mResponse: response, returnResponse: false}
                }
            }
        }

        return {
            mReq: req,
            mResponse: response.setErrorResponse({ statusCode: 403, statusMessage: "Page expired" }),
            returnResponse: true
        }
    }
}
