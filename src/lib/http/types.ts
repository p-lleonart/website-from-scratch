import { File } from "formidable"


export interface ExtractBodyInterface {
    fields: RequestBody
    files: RequestFiles
}

export type RequestBody = Record<string, string>

export type RequestFiles = Record<string, File[] | undefined>

export type ResponseBody = string | Buffer
