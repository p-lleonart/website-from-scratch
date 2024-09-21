import { type Context, render } from "./modules/template-parser"
import { existsSync } from "node:fs"
import { type Headers } from "./types"


export default class Response {
    private statusCode: number
    private headers: Headers
    private body: string

    constructor() {
        this.statusCode = 200
        this.headers = {}
        this.body = ""
    }

    /**
     * 
     * @param url 
     * @param statusCode 3XX here, default is 302
     * @returns 
     */
    public redirect(url: string, statusCode: number = 302): Response {
        this.statusCode = 302
        this.headers['Location'] = url
        return this
    }

    public setResponse(options: {
        contentType: string,
        body: string,
        statusCode?: number,
    }) {
        if (options.statusCode) this.setStatusCode(options.statusCode)

        this.setHeader("Content-Type", options.contentType)
        this.setBody(options.body)
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

    public setStatusCode(statusCode: number) {
        if (100 > statusCode || statusCode > 600) throw Error('[app] error: the status code must belong to [100;599]')
        this.statusCode = statusCode
    }

    /**
     * Use this carefully, it overrides completly all other headers.
     * @param headers 
     */
    public setHeaders(headers: Headers) {
        this.headers = headers
    }

    public setHeader(headerName: string, value: string) {
        this.headers[headerName] = value
    }

    public setBody(body: string) {
        this.body = body
    }

    public getStatusCode() {
        return this.statusCode
    }

    public getHeaders() {
        return this.headers
    }

    public getHeader(headerName: string) {
        if (this.headers[headerName]) return this.headers[headerName]

        return null
    }

    public getBody() {
        return this.body
    }
}
