import { ErrorsController } from "./errors"
import { extractRouteParams, setAssetsRoutes, patternToRegex } from "./helpers"
import { createServer, IncomingMessage, ServerResponse } from "http"
import { Request } from './request'
import { Response } from "./response"
import { ROUTES as _ROUTES } from "./app/routes"
import { HttpContext } from "./types"


function getEndpoint(method: string | undefined, request: Request) {
    const url = request.url(true) as URL
    let path: string

    if (!method) method = 'GET'
    if (url.pathname !== "/" && url.pathname[url.pathname.length - 1] === "/") path = url.pathname.slice(0, -1)
    else path = url.pathname

    for (const key in ROUTES) {
        const pattern = key.slice(method.length + 1)
        const regex = ROUTES[key]._regex!  // exists because where set before server launch
        const match = path.match(regex)

        if (key.startsWith(method) && match) {
            request._setParams(extractRouteParams(match, pattern))
            return `${method}:${pattern}`
        }
    }

    return `${method}:${path}`
}


const ROUTES = await setAssetsRoutes(_ROUTES)

/** set regex up (for the routes without regex) */
Object.keys(ROUTES).forEach(key => {
    if (!ROUTES[key]._regex) {
        const pattern = '/' + key.split(":/")[1]
        ROUTES[key]._regex = patternToRegex(pattern)
    }
})

createServer(async (req: IncomingMessage, res: ServerResponse) => {
    let httpContext: HttpContext = {
        req,
        request: await Request.init(req),
        response: new Response()
    }

    /** if the url as a '/' at the end, remove it (to avoid 404 for defined routes) */
    const endpoint = getEndpoint(req.method, httpContext.request)

    try {
        if(ROUTES[endpoint] !== undefined) {
            const route = ROUTES[endpoint]
            let returnResponseAfterMiddleware = false

            if (route.middlewares) {
                let i = 0
                while (!returnResponseAfterMiddleware && i < route.middlewares.length) {
                    const {
                        httpContext: mHttpContext,
                        returnResponse
                    } = await route.middlewares[i].handle(httpContext)

                    httpContext = mHttpContext
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
    
    console.log(`[${endpoint}] ${httpContext.response.statusCode}`)

    res.writeHead(httpContext.response.statusCode, httpContext.response.headers)
    res.write(httpContext.response.body)

    res.end()
})
    .listen(3000)

console.log("Server starting...")
