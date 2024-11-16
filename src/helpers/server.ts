import { CONFIG } from "#app/config"
import { ErrorsController } from "./errors-controller"
import { instanciateGlobalMiddlewareList } from "./internals"
import { Request, Response } from "#lib/http"
import { type Controllers, setupContainer } from "#lib/ioc"
import { MiddlewareError } from "#root/middleware"
import type { HttpContext, Route, Routes } from "#root/types"
import { extractRouteParams, patternToRegex } from "./router"


export function getEndpoint(routes: Routes, method: string | undefined, request: Request) {
    const url = request.url(true) as URL
    let path: string

    if (!method) method = 'GET'
    if (url.pathname !== "/" && url.pathname[url.pathname.length - 1] === "/") path = url.pathname.slice(0, -1)
    else path = url.pathname

    for (const key in routes) {
        const pattern = key.slice(method.length + 1)
        const regex = routes[key]._regex!  // exists because they were set before server launch
        const match = path.match(regex)

        if (key.startsWith(method) && match) {
            request._setParams(extractRouteParams(match, pattern))
            return `${method}:${pattern}`
        }
    }

    return `${method}:${path}`
}

export async function runController(
    httpContext: HttpContext,
    controllers: Controllers,
    controller: [string, string],
    args?: any
): Promise<Response> {
    return await (controllers[controller[0]] as any)[controller[1]](httpContext, args)
}

export async function runMiddlewares(httpContext: HttpContext, route: Route) {
    try {
        /** runs all middlewares */
        httpContext = await route.middlewares![0].handle(httpContext)
    } catch (e: any) {
        if (e instanceof MiddlewareError) {
            httpContext.response = httpContext.response.setResponse(e.responseData)
        }
    }
    return httpContext
}

export async function runView(httpContext: HttpContext, controllers: Controllers, route: Route): Promise<Response> {
    if (route.controller) {
        return await runController(httpContext, controllers, route.controller)
    } else {
        return await route.callback(httpContext)
    }
}

export async function setupControllers() {
    const controllers = await setupContainer()
    controllers["ErrorsController"] = new ErrorsController()
    return controllers
}

export function setupRoutes(routes: Routes) {
    Object.keys(routes).forEach(key => {
        const route = routes[key]
        if (!route._regex) {
            const pattern = '/' + key.split(":/")[1]
            route._regex = patternToRegex(pattern)
        }

        route.middlewares = instanciateGlobalMiddlewareList(CONFIG.globalMiddlewares)
            .concat(route.middlewares ?? [])

        for (let i = 1; i < route.middlewares.length; i++) {
            route.middlewares[i - 1].setNext(route.middlewares[i])
        }
    })
    return routes
}
