import { IncomingMessage } from "http"
import { parse } from "querystring"


/**
 * This function is the base for all data type that can be parsed by splitting only two times a string, like
 * cookies or request body.
 * 
 * For more information, please see the functions that use this one in this file.
 * 
 * @param delimiter1 
 * @param delimiter2 
 * @param raw 
 * @returns 
 */
export function parseBase(delimiter1: string, delimiter2: string, raw: string): {[key: string]: string} {
    let datas = raw.split(delimiter1)
    let output: {[key: string]: string} = {}
    
    for(const data of datas) {
        let i = data.split(delimiter2)
        output[i[0]] = i[1]
    }

    return output
}


/**
 * Parses request cookies (that you can get with `req.headers.cookie`).
 * 
 * E.g: cookie1=value1; cookie2=value2
 * 
 * Nota: even if you set other params with this cookie, the `req.headers.cookie` will give you always a string
 * of this format. You'll always have the key and the value, and just this.
 * 
 * @param raw 
 * @returns 
 */
export function parseCookieData(raw: string | undefined): {[key: string]: string} {
    if (raw === undefined) return {}
    
    return parseBase("; ", "=", raw)
}

/**
 * Parses request body.
 * 
 * E.g: data1=value1&data2=value2
 * @param raw 
 * @returns 
 */
export function parseRequestData(raw: string): {[key: string]: string} {
    return parse(raw) as {[key: string]: string}
}

export async function extractPostRequestData(req: IncomingMessage): Promise<string> {
    let body = await new Promise<string>((resolve, reject) => {
        let _body: string = ""

        req.on('data', chunk => {
            _body += chunk.toString()
        })
      
        req.on('end', () => {
            resolve(_body)
        })
    })

    return body
}
