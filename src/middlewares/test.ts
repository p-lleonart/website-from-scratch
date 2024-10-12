import { getCookie } from "@/helpers"
import { Middleware } from "@/middleware"
import { HttpContext } from "@/types"


export class TestMiddleware extends Middleware {
    public async handle({ req, response }: HttpContext) {
        console.log("test middleware")
        return {mReq: req, mResponse: response, returnResponse: false}
    }
}


export class Test2Middleware extends Middleware {
    public async handle({ req, response }: HttpContext) {
        console.log("test 2 middleware")
        response.setHeader("MessagesSent", getCookie(req, "MessagesSent"))
        return {mReq: req, mResponse: response, returnResponse: false}
    }
}

export class Test3Middleware extends Middleware {
    public async handle({ req, response }: HttpContext) {
        console.log("test 3 middleware")
        response = response.setErrorResponse({
            statusCode: 403,
            statusMessage: "Unauthorized"
        })
        return {mReq: req, mResponse: response, returnResponse: true}
    }
}
