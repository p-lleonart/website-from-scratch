import { IncomingMessage } from "http"
import { getPostBody } from "@/helpers"

/**
 * this is a draft actually
 */
export class Request {
    /**
     * Use ``Request.init()`` to create a new instance of ``Request``.
     * @param req 
     */
    private constructor(
        private req: IncomingMessage,
        private body: { [key: string]: string }
    ) {
    }

    public static async init(req: IncomingMessage) {
        return new Request(req, await getPostBody(req))
    }

    setBody(body: { [key: string]: string }) {
        this.body = body
    }

    getBody() {
        return this.body
    }
}
