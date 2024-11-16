import { Middleware } from "#root/middleware"


export function instanciateGlobalMiddlewareList(globalMiddlewares: (typeof Middleware)[]) {
    let result = []
    for (let i = 0; i < globalMiddlewares.length; i++) {
        result.push(new globalMiddlewares[i]())
    }
    return result
}
