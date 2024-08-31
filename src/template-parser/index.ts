import { readFileSync } from "fs"

import { Context } from "./types"
import { TemplateNotFound } from "./errors"
import { parse } from "./handlers"


export function render(path: string, context: Context) {
    let template = "<pre>[template-parser] default html template</pre>"
    try {
        template = readFileSync(path, { encoding: "utf8" })
    } catch (e) {
        new TemplateNotFound(path)
    }

    return parse(template, context)
}
