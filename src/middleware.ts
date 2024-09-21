import { IncomingMessage } from "http"

import { Response } from "./types"

export class Middleware {
    public async handle(req: IncomingMessage, response: Response) {
        return {mReq: req, mResponse: response, returnResponse: false}
    }
}
