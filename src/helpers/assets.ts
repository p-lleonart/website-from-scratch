import { lstatSync, readdir } from "fs"
import { readdir as readdirP, readFile } from "fs/promises"
import { IncomingMessage } from "http"

import { Response, Route } from "../types"


/**
 * Register routes of files contained in `./public`.
 * 
 * Warning: the `Content-type` header support for files in the public directory are limited to the most common
 * types (for more informations, please see in the `content-types.json` in this project).
 * Every file without extention or with a format that isn't supported will be served as plain text.
 * 
 * @param routes
 * @returns {void}
 */
export function setAssetsRoutes(routes: {[key: string]: Route}): void {
    readdir("./src/public", async (err, files) => {
        if(err) throw err

        if(!files) return

        const supportedContentTypes = JSON.parse(await readFile("./src/content-types.json", "utf8"))

        for(const asset of files!) {
            if(lstatSync(`./src/public/${asset}`).isDirectory()) {
                const newFiles = await readdirP(`./src/public/${asset}`, {recursive: true})

                for (const newFile of newFiles) {
                    files.push(`${asset}/${newFile}`)
                }

                /** we don't want to add a route to read the directory (that will end up in 500 in all cases) */
                continue
            }

            const assetEndpoint = `GET:/${asset}`
            const ext = assetEndpoint.split('.')[assetEndpoint.split('.').length - 1]

            routes[assetEndpoint] = {
                callback: async (req: IncomingMessage, response: Response) => {
                    response.statusCode = 200

                    /** check if the extension is supported */
                    response.headers['Content-Type'] = supportedContentTypes[ext] !== undefined
                        ? supportedContentTypes[ext]
                        : "text/plain"
                    
                    response.body = await readFile(`./src/public/${asset}`, "utf8")
                    return response
                }
            }
        }
    })
}
