import { Middleware, MiddlewareError } from "#root/middleware"
import { HttpContext } from "#root/types"


export class TestMiddleware extends Middleware {
    public async handle(httpContext: HttpContext) {
        console.log("test middleware")
        return super.handle(httpContext)
    }
}


export class Test2Middleware extends Middleware {
    public async handle(httpContext: HttpContext) {
        console.log("test 2 middleware")
        httpContext.response.setHeader("MessagesSent", httpContext.request.cookieHandler.getCookie("MessagesSent"))
        return super.handle(httpContext)
    }
}

export class Test3Middleware extends Middleware {
    public async handle(httpContext: HttpContext) {
        console.log("test 3 middleware")

        const isAuthorized = false  // this is only an example

        if (isAuthorized) {
            return super.handle(httpContext)
        }

        httpContext.response.setErrorResponse({
            statusCode: 403,
            statusMessage: "Unauthorized"
        })
        return httpContext
    }
}

export class Test4Middleware extends Middleware {
    /** same as Test3Middleware, but with exceptions */
    public async handle(httpContext: HttpContext) {
        console.log("test 4 middleware")

        const isAuthorized = false  // this is only an example

        if (isAuthorized) {
            return super.handle(httpContext)
        }

        throw new MiddlewareError(403, "Not authorized", "Unauthorized")
    }
}
