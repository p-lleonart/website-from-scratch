import { HttpContext, MiddlewareHandlerContract } from "./types"

export class Middleware {
    public async handle(httpContext: HttpContext): Promise<MiddlewareHandlerContract> {
        return {httpContext, returnResponse: false}
    }
}
