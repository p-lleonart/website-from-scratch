import { getSessionId, setSessionIdCookie } from "./helpers"
import { ModuleConfig } from "#root/types"
import { SessionMiddleware } from "./middleware"


type SessionConfig = ModuleConfig & {
    ID_COOKIE_NAME: string
    ID_COOKIE_EXPIRES: number
    ID_LENGTH: number
}

export {
    getSessionId,
    SessionConfig,
    SessionMiddleware,
    setSessionIdCookie,
}
