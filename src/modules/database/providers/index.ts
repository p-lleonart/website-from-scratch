import { CONFIG } from "#app/config"
import { DatabaseProviderInterface } from "#database/types"
import SQLiteDatabaseProvider from "./sqlite"


let _provider: DatabaseProviderInterface

switch (CONFIG.modules.database.PROVIDER) {
    case "sqlite":
    default:
        _provider = new SQLiteDatabaseProvider()
        break
}

export const provider = _provider
export {
    SQLiteDatabaseProvider,
}
