import { IncomingMessage } from "http"
import { existsSync } from "node:fs"

import { extractPostRequestData, parseRequestData } from "./parsing"
import { Response } from "../types"
import { render } from "../template-parser"
import { Context } from "../template-parser/types"


export const getPostBody = async (req: IncomingMessage) => parseRequestData(await extractPostRequestData(req))

export function getUrlParam(req: IncomingMessage, paramName: string) {
    return new URL(req.url!, `http://${req.headers.host}`).searchParams!.get(paramName)
}

export function setResponse(response: Response, options: {body: string, contentType: string, statusCode?: number}) {
    response.statusCode = options.statusCode ? options.statusCode : 200
    response.headers['Content-Type'] = options.contentType
    response.body = options.body
    return response
}

export async function setHttpErrorResponse(response: Response, options: {
    body?: string,
    context?: Context,
    contentType?: string,
    statusCode: number,
    statusMessage: string
}) {
    let body: string
    let contentType: string
    if (options.body && options.contentType) {
        body = options.body
        contentType = options.contentType
    } else {
        const path = `./templates/errors/${options.statusCode}.html`

        if(existsSync(path) && options.context) {
            body = render(path, options.context)
        } else {
            body = `<h1>Error ${options.statusCode}: ${options.statusMessage}</h1>`
        }
        
        contentType = "text/html"
    }
    return setResponse(response, {
        body,
        contentType,
        statusCode: options.statusCode
    })
}
