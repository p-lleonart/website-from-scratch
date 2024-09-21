import { IncomingMessage } from "http"
import { Middleware } from "../middleware"
import { Response } from "../types"
import { getCookie, setHttpErrorResponse } from "../helpers"


export class TestMiddleware extends Middleware {
    public async handle(req: IncomingMessage, response: Response) {
        console.log("test middleware")
        return {mReq: req, mResponse: response, returnResponse: false}
    }
}


export class Test2Middleware extends Middleware {
    public async handle(req: IncomingMessage, response: Response) {
        console.log("test 2 middleware")
        response.headers["MessagesSent"] = getCookie(req, "MessagesSent")
        return {mReq: req, mResponse: response, returnResponse: false}
    }
}

export class Test3Middleware extends Middleware {
    public async handle(req: IncomingMessage, response: Response) {
        console.log("test 3 middleware")
        response = await setHttpErrorResponse(response, {
            statusCode: 403,
            statusMessage: "Unauthorized"
        })
        return {mReq: req, mResponse: response, returnResponse: true}
    }
}
