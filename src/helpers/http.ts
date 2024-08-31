import { IncomingMessage } from "http"

import { extractPostRequestData, parseRequestData } from "./parsing"
import { Response } from "../types"


export const getPostBody = async (req: IncomingMessage) => parseRequestData(await extractPostRequestData(req))

export function setResponse(response: Response, options: {body: string, contentType: string, statusCode?: number}) {
    response.statusCode = options.statusCode ? options.statusCode : 200
    response.headers['Content-Type'] = options.contentType
    response.body = options.body
    return response
}
