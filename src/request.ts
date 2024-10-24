import { CookieHandler } from "./cookie-handler"
import { IncomingMessage } from "http"
import { parseRequestData } from "@/helpers"

/**
 * this is a draft actually
 */
export class Request {
    #body: { [key: string]: string }
    #cookieHandler: CookieHandler
    #params: URLSearchParams

    /**
     * Use ``Request.init()`` to create a new instance of ``Request``.
     * @param req 
     */
    private constructor(
        private req: IncomingMessage,
        body: { [key: string]: string }
    ) {
        this.#body = body
        this.#cookieHandler = new CookieHandler(this)
        this.#params = (this.url(true) as URL).searchParams
    }

    public static async init(req: IncomingMessage) {
        const body = parseRequestData(await Request.extractPostRequestData(req))
        return new Request(
            req,
            body
        )
    }

    set body(body: { [key: string]: string }) {
        this.#body = body
    }

    get body() {
        return this.#body
    }

    get cookieHandler(): CookieHandler {
        return this.#cookieHandler
    }

    get params(): URLSearchParams {
        return this.#params
    }

    get headers() {
        return this.req.headers
    }

    get httpVersion() {
        return this.req.httpVersion
    }

    get method() {
        return this.req.method
    }

    public url(withBase = false) {
        if (withBase) return new URL(this.req.url ? this.req.url : '/', `http://${this.req.headers.host}`)

        return this.req.url
    }

    private static async extractPostRequestData(req: IncomingMessage): Promise<string> {
        return await new Promise<string>((resolve, reject) => {
            let _body: string = ""
    
            req.on('data', chunk => {
                _body += chunk.toString()
            })
          
            req.on('end', () => {
                resolve(_body)
            })
        })
    }
}
