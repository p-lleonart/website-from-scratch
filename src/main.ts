import { createServer, IncomingMessage, ServerResponse } from "http"

import { ErrorsController } from "./errors"
import { Response } from "./types"
import { ROUTES } from "./routes"
import { setAssetsRoutes } from "./assets-handler"


setAssetsRoutes(ROUTES)

createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const endpoint = `${req.method}:${req.url}`
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
