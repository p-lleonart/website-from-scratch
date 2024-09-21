import { ErrorsController } from "./errors"
import { setAssetsRoutes } from "./helpers"
import { createServer, IncomingMessage, ServerResponse } from "http"
import Response from "./response"
import { ROUTES } from "./routes"
import { HttpContext } from "./types"


setAssetsRoutes(ROUTES)

createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const url = new URL(req.url ? req.url : '/', `http://${req.headers.host}`)

    /** if the url as a '/' at the end, remove it (to avoid 404 for defined routes) */
    const endpoint = `${req.method}:${url.pathname[-1] === "/" ? url.pathname.slice(0, -1) : url.pathname}`
    
    let response = new Response()
    let httpContext: HttpContext = {req, response}

    try {
        if(ROUTES[endpoint] !== undefined) {
            const route = ROUTES[endpoint]
            let returnResponseAfterMiddleware = false

            if (route.middlewares) {
                let i = 0
                while (!returnResponseAfterMiddleware && i < route.middlewares.length) {
                    const {
                        mReq,
                        mResponse,
                        returnResponse
                    } = await route.middlewares[i].handle(httpContext)

                    httpContext.req = mReq
                    httpContext.response = mResponse
                    returnResponseAfterMiddleware = returnResponse
                    i++
                }
            }

            if (!returnResponseAfterMiddleware) {
                httpContext.response = await ROUTES[endpoint].callback(httpContext)
            }
        } else {
            httpContext.response = await ErrorsController.notFound(httpContext)
        }
    } catch (e: any) {
        httpContext.response = await ErrorsController.serverError(httpContext, {errorMessage: e.message})
    }
    
    console.log(`[${endpoint}] ${httpContext.response.getStatusCode()}`)

    res.writeHead(httpContext.response.getStatusCode(), httpContext.response.getHeaders())
    res.write(httpContext.response.getBody())

    res.end()
})
    .listen(3000)

console.log("Server starting...")
