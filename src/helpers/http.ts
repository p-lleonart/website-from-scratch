import { IncomingMessage } from "http"
import { extractPostRequestData, parseRequestData } from "./parsing"


export const getPostBody = async (req: IncomingMessage) => parseRequestData(await extractPostRequestData(req))

export function getUrlParam(req: IncomingMessage, paramName: string) {
    return new URL(req.url!, `http://${req.headers.host}`).searchParams!.get(paramName)
}
