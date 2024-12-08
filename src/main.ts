import { readFileSync } from "fs"
import { createServer, IncomingMessage, Server, ServerResponse } from "http"
import { createServer as createHttpsServer } from "https"

import { CONFIG } from "./app/config"
import { setAssetsRoutes } from "./helpers"
import { requestListener, setupControllers, setupRoutes } from "./helpers/server"
import { ROUTES as _ROUTES } from "./app/routes"


/** set routes up:
 * - assets routes
 * - regex (for the routes without regex)
 * - next middlewares registering
 */
const ROUTES = setupRoutes(await setAssetsRoutes(_ROUTES))

/** load controllers */
const controllers = await setupControllers()

let server: Server
let httpsServer: Server | undefined
let httpPort = CONFIG.port

if (CONFIG.https) {
    httpsServer = createHttpsServer(
        {
            key: readFileSync(CONFIG.https.key, "utf-8"),
            cert: readFileSync(CONFIG.https.cert, "utf-8")
        },
        async (req: IncomingMessage, res: ServerResponse) => requestListener(req, res, ROUTES, controllers)
    )

    server = createServer((req: IncomingMessage, res: ServerResponse) => {
        res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
        res.end();
    })

    httpPort = 80

    httpsServer.listen(443, () => console.log(`HTTPS server starting on port 443...`))
} else {
    server = createServer(
        async (req: IncomingMessage, res: ServerResponse) => requestListener(req, res, ROUTES, controllers)
    )
}

server.listen(httpPort, () => console.log(`HTTP server starting on port ${httpPort}...`))
