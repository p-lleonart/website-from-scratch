import formidable from "formidable"

import { CONFIG } from "./app/config"
import { setAssetsRoutes } from "./helpers"
import { getEndpoint, runController, runMiddlewares, runView, setupControllers, setupRoutes } from "./helpers/server"
import { createServer, IncomingMessage, ServerResponse } from "http"
import { Request, Response } from '#lib/http'
import { ROUTES as _ROUTES } from "./app/routes"
import { HttpContext } from "./types"


/** set routes up:
 * - assets routes
 * - regex (for the routes without regex)
 * - next middlewares registering
 */
const ROUTES = setupRoutes(await setAssetsRoutes(_ROUTES))

/** load controllers */
const controllers = await setupControllers()

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const form = {
        incomingForm: formidable(CONFIG.form.formOptions ?? {}),
        errorHandler: CONFIG.form.errorHandler
    }

    let httpContext: HttpContext = {
        req,
        request: await Request.init(form, req),
        response: new Response()
    }

    let error: Error | undefined

    /** if the url as a '/' at the end, remove it (to avoid 404 for defined routes) */
    const endpoint = getEndpoint(ROUTES, req.method, httpContext.request)

    if (httpContext.request.formStatus === "ok") {
        try {
            if(ROUTES[endpoint] !== undefined) {
                const route = ROUTES[endpoint]

                /** response context is by default on "middleware" */

                if (route.middlewares && route.middlewares.length > 0) {
                    httpContext = await runMiddlewares(httpContext, route)
                }

                httpContext.response._changeContext("route")

                if (httpContext.response.shouldRunRouteCallback()) {
                    httpContext.response = await runView(httpContext, controllers, route)
                }
            } else {  // HTTP 404
                httpContext.response = await runController(httpContext, controllers, ["ErrorsController", "notFound"])
            }
        } catch (e: any) {  // HTTP 500
            httpContext.response = await runController(
                httpContext,
                controllers,
                ["ErrorsController", "serverError"],
                { name: e.name, message: e.message, stack: e.stack }
            )
            error = e
        }
    } else {
        httpContext.response = await runController(
            httpContext,
            controllers,
            ["ErrorsController", "badRequest"],
            { message: httpContext.request.formStatus }
        )
        error = new Error("badRequest")
    }

    
    console.log(`[${endpoint}] ${httpContext.response.statusCode}`)

    if (error) {
        console.log(`\n\n\t${error.stack}\n\n`)
    }

    res.writeHead(httpContext.response.statusCode, httpContext.response.headers)
    res.write(httpContext.response.body)

    res.end()
})

server.listen(CONFIG.port)

console.log(`Server starting on port ${CONFIG.port}...`)
