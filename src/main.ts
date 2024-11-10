import { extractRouteParams, setAssetsRoutes, patternToRegex, setSessionIdCookie } from "./helpers"
import { ErrorsController } from "./helpers/errors-controller"
import { createServer, IncomingMessage, ServerResponse } from "http"
import { BaseController, setupContainer } from "#lib/ioc"
import { Request, Response } from '#lib/http'
import { ROUTES as _ROUTES } from "./app/routes"
import { HttpContext } from "./types"
import { MiddlewareError } from "./middleware"


async function runController(
    httpContext: HttpContext,
    controllers: { [key: string]: BaseController },
    controller: [string, string],
    args?: any
) {
    return await (controllers[controller[0]] as any)[controller[1]](httpContext, args)
}

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

/** set regex up (for the routes without regex) and next middlewares registering */
Object.keys(ROUTES).forEach(key => {
    const route = ROUTES[key]
    if (!route._regex) {
        const pattern = '/' + key.split(":/")[1]
        route._regex = patternToRegex(pattern)
    }

    if (route.middlewares) {
        for (let i = 1; i < route.middlewares.length; i++) {
            route.middlewares[i - 1].setNext(route.middlewares[i])
        }
    }
})

/** load controllers */
const controllers = await setupContainer()
controllers["ErrorsController"] = new ErrorsController()

createServer(async (req: IncomingMessage, res: ServerResponse) => {
    let httpContext: HttpContext = {
        req,
        request: await Request.init(req),
        response: new Response()
    }

    /** if the url as a '/' at the end, remove it (to avoid 404 for defined routes) */
    const endpoint = getEndpoint(req.method, httpContext.request)

    const sessionId = httpContext.request.cookieHandler.getCookie("session_id")
    if (!sessionId) {
        httpContext.response = setSessionIdCookie(httpContext)
    }

    try {
        if(ROUTES[endpoint] !== undefined) {
            const route = ROUTES[endpoint]

            /** response context is by default on "middleware" */

            if (route.middlewares && route.middlewares.length > 0) {
                try {
                    /** runs all middlewares */
                    httpContext = await route.middlewares[0].handle(httpContext)
                } catch (e: any) {
                    if (e instanceof MiddlewareError) {
                        httpContext.response = httpContext.response.setResponse(e.responseData)
                    }
                }
            }

            httpContext.response._changeContext("route")

            if (httpContext.response.shouldRunRouteCallback()) {
                if (route.controller) {
                    httpContext.response = await runController(httpContext, controllers, route.controller)
                } else {
                    httpContext.response = await route.callback(httpContext)
                }
            }
        } else {
            httpContext.response = await runController(httpContext, controllers, ["ErrorsController", "notFound"])
        }
    } catch (e: any) {
        httpContext.response = await runController(
            httpContext,
            controllers,
            ["ErrorsController", "serverError"],
            { name: e.name, message: e.message, stack: e.stack }
        )
    }
    
    console.log(`[${endpoint}] ${httpContext.response.statusCode}`)

    res.writeHead(httpContext.response.statusCode, httpContext.response.headers)
    res.write(httpContext.response.body)

    res.end()
})
    .listen(3000)

console.log("Server starting...")
