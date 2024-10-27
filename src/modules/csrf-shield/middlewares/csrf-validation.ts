import { Middleware } from "#root/middleware"
import { HttpContext } from "#root/types"
import CsrfToken from "#csrf-shield/models/csrf-token"

export default class CsrfValidationMiddleware extends Middleware {
    public async handle({ req, request, response }: HttpContext) {
        const reqId = request.body._reqId
        const reqToken = request.body._token

        if (reqId) {
            const csrfToken = await CsrfToken.find(reqId)

            if (csrfToken) {
                if (csrfToken.token === reqToken) {
                    await csrfToken.destroy()
                    return {httpContext: { req, request, response }, returnResponse: false}
                }
            }
        }

        return {
            httpContext: {
                req,
                request,
                response: response.setErrorResponse({ statusCode: 403, statusMessage: "Page expired" }),
            },
            returnResponse: true
        }
    }
}
