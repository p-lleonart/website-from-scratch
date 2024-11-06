import { type Context, render } from "#template-parser"
import { existsSync } from "node:fs"
import type { ResponseContext, Headers } from "./types"


export class Response {
    #statusCode: number
    #headers: Headers
    #body: string
    #sendAfterMiddleware: boolean = false
    #context: ResponseContext

    constructor() {
        this.#statusCode = 200
        this.#headers = {}
        this.#body = ""
        this.#context = "middleware"
    }

    /**
     * 
     * @param url 
     * @param statusCode 3XX here, default is 302
     * @returns 
     */
    public redirect(url: string, statusCode: number = 302): Response {
        this.#statusCode = statusCode
        this.#headers['Location'] = url

        /** if the response is edited in a middleware, the server will send the response immediatly after this */
        this.checkIfEditedDuringAMiddleware()
        
        return this
    }

    public setResponse(options: {
        contentType: string,
        body: string,
        statusCode?: number,
    }) {
        if (options.statusCode) this.statusCode = options.statusCode

        this.setHeader("Content-Type", options.contentType)
        this.#body = options.body

        /** cf. Response.redirect() note */
        this.checkIfEditedDuringAMiddleware()

        return this
    }

    public setErrorResponse(options: {
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
        return this.setResponse({
            body,
            contentType,
            statusCode: options.statusCode
        })
    }

    /** Getters and setters */

    set statusCode(statusCode: number) {
        if (100 > statusCode || statusCode > 600) throw Error('[app] error: the status code must belong to [100;599]')
        this.#statusCode = statusCode
    }

    /**
     * Use this carefully, it overrides completly all other headers.
     * @param headers 
     */
    set headers(headers: Headers) {
        this.#headers = headers
    }

    public setHeader(headerName: string, value: string) {
        this.#headers[headerName] = value
    }

    set body(body: string) {
        this.#body = body
    }

    get statusCode() {
        return this.#statusCode
    }

    get headers() {
        return this.#headers
    }

    public header(headerName: string) {
        if (this.#headers[headerName]) return this.#headers[headerName]

        return null
    }

    get body() {
        return this.#body
    }

    _changeContext(newContext: ResponseContext) {
        this.#context = newContext
    }

    private checkIfEditedDuringAMiddleware() {
        if (this.#context === "middleware") this.#sendAfterMiddleware = true
    }

    shouldRunRouteCallback() {
        return !this.#sendAfterMiddleware
    }
}
