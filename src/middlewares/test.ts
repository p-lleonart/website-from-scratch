import { Middleware } from "@/middleware"
import { HttpContext } from "@/types"


export class TestMiddleware extends Middleware {
    public async handle(httpContext: HttpContext) {
        console.log("test middleware")
        return {httpContext, returnResponse: false}
    }
}


export class Test2Middleware extends Middleware {
    public async handle(httpContext: HttpContext) {
        console.log("test 2 middleware")
        httpContext.response.setHeader("MessagesSent", httpContext.request.cookieHandler.getCookie("MessagesSent"))
        return {httpContext, returnResponse: false}
    }
}

export class Test3Middleware extends Middleware {
    public async handle(httpContext: HttpContext) {
        console.log("test 3 middleware")
        httpContext.response.setErrorResponse({
            statusCode: 403,
            statusMessage: "Unauthorized"
        })
        return {httpContext, returnResponse: true}
    }
}
