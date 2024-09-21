import { TemplateNotFound, VariableMissingInContext, WrongTypeVariable } from "./errors"
import { readFileSync } from "fs"
import { parse } from "./handlers"
import { type Context } from "./types"


function render(path: string, context?: Context) {
    let template = "<pre>[template-parser] default html template</pre>"
    try {
        template = readFileSync(path, { encoding: "utf8" })
    } catch (e) {
        new TemplateNotFound(path)
    }

    if (context) return parse(template, context)

    return parse(template, {})
}

export {
    Context,
    render,
    parse,
    TemplateNotFound,
    VariableMissingInContext,
    WrongTypeVariable
}
