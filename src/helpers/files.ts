import { readFile, rename, mkdir } from "fs/promises"
import { dirname } from "path"


export async function getFile(filename: string) {
    return await readFile(filename)
}

export async function getFileFromTmp(filename: string) {
    return await getFile(`./tmp/uploads/${filename}`)
}

export async function getFileFormat(filename: string) {
    const supportedContentTypes = JSON.parse(await readFile("./src/content-types.json", "utf8"))

    const ext = filename.split('.')[filename.split('.').length-1]
    
    return supportedContentTypes[ext.toLowerCase()] ?? "text/plain"
}

export async function fileExists(filename: string) {
    try {
        await getFile(filename)
        return true
    } catch (err) {
        return false
    }
}

/**
 * 
 * @param filepath File path of the file to move
 * @param newPath Destination folder
 * @param options 
 */
export async function move(
    filepath: string,
    newPath: string,
    options: { overwrite: false } = { overwrite: false }
) {
    const filename = filepath.split(/[\\\/]/).slice(-1)[0]
    newPath += "/"

    if (!options.overwrite && await fileExists(newPath + filename)) {
        console.error(`[file] error: cannot move the file ${filepath} to ${newPath + filename} because the file already exists.`)
    }

    await mkdir(dirname(newPath + filename), {
        recursive: true,
    })
    
    try {
        await rename(filepath, newPath + filename)
    } catch (err: any) {
        console.error(`[file] error: cannot move the file ${filepath} to ${newPath + filename} : ${err.message}`)
    }
}
