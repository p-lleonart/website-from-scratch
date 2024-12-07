import { createId } from "@paralleldrive/cuid2"
import { setAssetsRoutes } from "./assets"
import { ErrorsController } from "./errors-controller"
import { getFile, getFileFormat, getFileFromTmp, fileExists, move } from "./files"
import { parseBase, parseCookieData } from "./parsing"
import { extractRouteParams, patternToRegex } from "./router"
import { getEndpoint, runController, runMiddlewares, runView, setupControllers, setupRoutes } from "./server"


function randomId(prefix?: string) {
    if (prefix) return `${prefix}_${createId()}`

    return createId()
}

export {
    ErrorsController,
    extractRouteParams,
    getEndpoint,
    getFile,
    getFileFormat,
    getFileFromTmp,
    fileExists,
    move,
    parseBase,
    parseCookieData,
    patternToRegex,
    randomId,
    runController,
    runMiddlewares,
    runView,
    setAssetsRoutes,
    setupControllers,
    setupRoutes,
}
