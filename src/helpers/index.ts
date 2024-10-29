import { createId } from "@paralleldrive/cuid2"
import { setAssetsRoutes } from "./assets"
import { parseBase, parseCookieData, parseRequestData } from "./parsing"
import { extractRouteParams, patternToRegex } from "./router"

function randomId(prefix?: string) {
    if (prefix) return `${prefix}_${createId()}`

    return createId()
}

export {
    extractRouteParams,
    setAssetsRoutes,
    randomId,
    parseBase,
    parseCookieData,
    parseRequestData,
    patternToRegex
}
