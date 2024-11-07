import { createId } from "@paralleldrive/cuid2"
import { setAssetsRoutes } from "./assets"
import { ErrorsController } from "./errors-controller"
import { parseBase, parseCookieData, parseRequestData } from "./parsing"
import { extractRouteParams, patternToRegex } from "./router"

function randomId(prefix?: string) {
    if (prefix) return `${prefix}_${createId()}`

    return createId()
}

export {
    ErrorsController,
    extractRouteParams,
    setAssetsRoutes,
    randomId,
    parseBase,
    parseCookieData,
    parseRequestData,
    patternToRegex
}
