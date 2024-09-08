import { createServer, IncomingMessage, ServerResponse } from "http"

import { ErrorsController } from "./errors"
import { Response } from "./types"
import { ROUTES } from "./routes"
import { setAssetsRoutes } from "./helpers/assets"


setAssetsRoutes(ROUTES)

createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const url = new URL(req.url ? req.url : '/', `http://${req.headers.host}`)

    /** if the url as a '/' at the end, remove it (to avoid 404 for defined routes) */
    const endpoint = `${req.method}:${url.pathname[-1] === "/" ? url.pathname.slice(0, -1) : url.pathname}`
    
    let response: Response = {
        statusCode: 200,
        headers: {},
        body: ""
    }

    try {
        if(ROUTES[endpoint] !== undefined) {
            response = await ROUTES[endpoint].callback(req, response)
        } else {
            response = await ErrorsController.notFound(req, response)
        }
    } catch (e: any) {
        response = await ErrorsController.serverError(req, response, {errorMessage: e.message})
    }
    
    console.log(`[${endpoint}] ${response.statusCode}`)

    res.writeHead(response.statusCode, response.headers)
    res.write(response.body)

    res.end()
})
    .listen(3000)

console.log("Server starting...")
