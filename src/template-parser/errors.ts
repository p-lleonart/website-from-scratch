
function logError (errorName: string, message: string): void {
    console.error(`[template-parser] ${errorName} error: ${message}`)
}

export class TemplateNotFound {
    constructor (path: string) {
        logError("TemplateNotFound", `the template ${path} doesn't exists.`)
    }
}

export class VariableMissingInContext {
    constructor (varName: string) {
        logError("VariableMissingInContext", `${varName} doesn't exists in the current context.`)
    }
}

export class WrongTypeVariable {
    constructor (varName: string, actualType: string, exceptedType: string) {
        logError("WrongTypeVariable", `${varName} must be ${exceptedType}, but is actually ${actualType}.`)
    }
}
