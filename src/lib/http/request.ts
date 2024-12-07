import { CookieHandler } from "./cookie-handler"
import { IncomingMessage } from "http"
import { Form } from "#root/types"
import { RouteParams } from "#root/types"
import { ExtractBodyInterface, RequestBody, RequestFiles } from "./types"

/**
 * this is a draft actually
 */
export class Request {
    #body: RequestBody
    #cookieHandler: CookieHandler
    #files: RequestFiles
    #formStatus: string = "ok"
    #query: URLSearchParams
    #params: RouteParams = {}

    /**
     * Use ``Request.init()`` to create a new instance of ``Request``.
     * @param req 
     */
    private constructor(
        private req: IncomingMessage,
        body: RequestBody,
        files: RequestFiles,
        formStatus?: string,
    ) {
        this.#body = body
        this.#cookieHandler = new CookieHandler(this)
        this.#files = files
        this.#query = (this.url(true) as URL).searchParams

        if (formStatus) this.#formStatus = formStatus
    }

    public static async init(form: Form, req: IncomingMessage) {
        let body
        try{
            body = await Request.extractPostRequestData(form, req)
        } catch (err: any) {
            return new Request(req, {}, {}, err)
        }

        return new Request(
            req,
            body.fields,
            body.files
        )
    }

    set body(body: RequestBody) {
        this.#body = body
    }

    get body() {
        return this.#body
    }

    get cookieHandler(): CookieHandler {
        return this.#cookieHandler
    }

    get files(): RequestFiles {
        return this.#files
    }

    get formStatus(): string {
        return this.#formStatus
    }

    get params(): RouteParams {
        return this.#params
    }

    get query(): URLSearchParams {
        return this.#query
    }

    /**
     * This is an internal method
     */
    _setParams(params: RouteParams) {
        this.#params = params
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

    private static async extractPostRequestData(form: Form, req: IncomingMessage): Promise<ExtractBodyInterface> {
        return new Promise(async (resolve, reject) => {
            let fields: Record<string, string[] | undefined> = {},
                files: RequestFiles = {},
                formattedFields: RequestBody = {}
            
            try {
                [fields, files] = await form.incomingForm.parse(req)
            } catch (err: any) {
                if (form.errorHandler) {
                    reject(form.errorHandler(err))
                }
    
                console.error(`[request parsing] error: ${err.message}`)
                reject(err.message)
            }
    
            /** we are only selecting the first value of each field */
            for (const item of Object.keys(fields)) {
                if (fields[item]) {
                    formattedFields[item] = fields[item][0]
                }
            }
    
            resolve({ fields: formattedFields, files })
        })
    }
}
