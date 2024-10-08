import { setAssetsRoutes } from "./assets"
import { getCookie, getCookies, setCookie, deleteCookie } from "./cookies"
import { getPostBody, getUrlParam } from "./http"
import { parseBase, parseCookieData, parseRequestData, extractPostRequestData } from "./parsing"
import { createId } from "@paralleldrive/cuid2"

function randomId(prefix?: string) {
    if (prefix) return `${prefix}_${createId()}`

    return createId()
}

export {
    setAssetsRoutes,
    getCookie,
    getCookies,
    setCookie,
    deleteCookie,
    getPostBody,
    getUrlParam,
    randomId,
    parseBase,
    parseCookieData,
    parseRequestData,
    extractPostRequestData
}
