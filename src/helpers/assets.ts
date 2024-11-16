import { lstatSync, readdir } from "fs"
import { readdir as readdirP, readFile } from "fs/promises"
import { HttpContext, Routes } from "#root/types"


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
export function setAssetsRoutes(routes: Routes): Promise<Routes> {
    return new Promise((resolve) => readdir("./src/public", async (err, files) => {
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
                callback: async ({ response }: HttpContext) => {
                    return response.setResponse({
                        contentType: supportedContentTypes[ext] !== undefined
                            ? supportedContentTypes[ext]
                            : "text/plain",
                        body: await readFile(`./src/public/${asset}`, "utf8")
                    })
                }
            }
        }

        resolve(routes)
    }))
}
