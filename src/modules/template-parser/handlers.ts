import { readFileSync } from "fs"

import { type Context } from "./types"
import { TemplateNotFound, VariableMissingInContext, WrongTypeVariable } from "./errors"


const REGEX_INCLUDE = /{{#include\s+([\w\/\.]+)}}([\s\S]*?){{\/include}}/g
const REGEX_FORLOOP = /{{#for\s+(\w+)\s+in\s+(\w+)}}([\s\S]*?){{\/for}}/g
const REGEX_IF = /{{#if\s+([\w]+)}}([\s\S]*?){{\/if}}/g
const REGEX_VAR = /{{\s*([\w]+)\s*}}/g

function includeHandler (template: string, context: Context) {
    return template.replace(REGEX_INCLUDE, (match, componentPath, content) => {
        try {
            const includedFile = readFileSync(componentPath, 'utf8')
            return parse(includedFile, context)
        } catch (err) {
            new TemplateNotFound(componentPath)
            return parse(content, context)
        }
    })
}

function forLoopHandler (template: string, context: Context) {
    return template.replace(REGEX_FORLOOP, (match, itemName, arrayName, content) => {
        const items = context[arrayName]

        if (!items) new VariableMissingInContext(arrayName)

        if (Array.isArray(items)) {
            return items.map(item => {
                const newContext = { ...context }
                newContext[itemName] = item
                return parse(content, newContext)
            }).join('')
        }
        new WrongTypeVariable(arrayName, typeof arrayName, "Array")
        return ''
    })
}

function conditionalHandler (template: string, context: Context) {
    return template.replace(REGEX_IF, (match, condition, content) => {
        return context[condition] ? content : ''
    })
}

function variableHandler (template: string, context: Context) {
    return template.replace(REGEX_VAR, (match, key) => {
        let val = context[key]

        if (!val) new VariableMissingInContext(key)

        if (Array.isArray(val)) {
            val = `[${val.join(', ')}]`
        }
        return `${val}` || ''
    })
}

export function parse (template: string, context: Context) {
    template = includeHandler(template, context)
    template = forLoopHandler(template, context)
    template = conditionalHandler(template, context)
    template = variableHandler(template, context)
    return template
}
