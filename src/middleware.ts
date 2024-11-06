import { HttpContext } from "./types"


export class MiddlewareError extends Error {
    constructor(
        protected responseStatus: number,
        protected responseMsg: string,
        message: string,
        protected contentType: string = "text/html"
    ) {
        super(`[middleware] error: "${message}"`)
    }
    
    get name(): string {
        return this.constructor.name
    }

    /**
     * Get arguments for creating the response from this error.
     */
    get responseData() {
        return {
            contentType: this.contentType,
            body: this.responseMsg,
            statusCode: this.responseStatus
        }
    }
}

export class Middleware {
    protected next?: Middleware

    /**
     * Sets the next middleware and returns the next middleware.
     * 
     * Useful for building things like `middleware.setNext(a).setNext(b)...`.
     */
    public setNext(next: Middleware): Middleware {
        this.next = next
        return next
    }

    public async handle(httpContext: HttpContext): Promise<HttpContext> {
        if (this.next) {
            return this.next.handle(httpContext)
        }

        return httpContext  // last middleware
    }
}
