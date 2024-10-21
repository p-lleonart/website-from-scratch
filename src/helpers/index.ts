import { setAssetsRoutes } from "./assets"
import { parseBase, parseCookieData, parseRequestData } from "./parsing"
import { createId } from "@paralleldrive/cuid2"

function randomId(prefix?: string) {
    if (prefix) return `${prefix}_${createId()}`

    return createId()
}

export {
    setAssetsRoutes,
    randomId,
    parseBase,
    parseCookieData,
    parseRequestData
}
