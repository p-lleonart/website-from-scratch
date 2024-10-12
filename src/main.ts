import 'module-alias/register'

import { ErrorsController } from "./errors"
import { setAssetsRoutes } from "./helpers"
import { createServer, IncomingMessage, ServerResponse } from "http"
import { Request } from './request'
import { Response } from "./response"
import { ROUTES } from "./routes"
import { HttpContext } from "./types"


setAssetsRoutes(ROUTES)

function getEndpoint(method: string | undefined, url: URL) {
    let path: string

    if (!method) method = 'GET'
    if (url.pathname[url.pathname.length - 1] === "/") path = url.pathname.slice(0, -1)
    else path = url.pathname

    return `${method}:${path}`
}

createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const url = new URL(req.url ? req.url : '/', `http://${req.headers.host}`)

    /** if the url as a '/' at the end, remove it (to avoid 404 for defined routes) */
    const endpoint = getEndpoint(req.method, url)
    
    let response = new Response()
    let request = await Request.init(req)
    let httpContext: HttpContext = {req, request, response}

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
