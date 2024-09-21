import { HttpContext } from "./types"

export class Middleware {
    public async handle({ req, response }: HttpContext) {
        return {mReq: req, mResponse: response, returnResponse: false}
    }
}
