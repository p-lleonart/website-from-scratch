import * as rules from "./rules"
import { Fields, ParsingResult, Rule } from "./types"


async function getRule(name: string, ...args: any[]): Promise<Rule> {
    if (name in rules) {
        const func = (rules as any)[name]
        return func(...args)
    } else {
        const customRules = await rules.importCustomRules()
        if (customRules && name in customRules) {
            const func = (customRules as any)[name]
            return func(...args)
        }
        throw new Error(`[validator] error: ${name} isn't a valid rule.`)
    }
}

export default class Schema {
    private constructor(private fields: Fields, customRules: any) {
        let errors: string[] = []

        for (const field of Object.keys(fields)) {
            for (const rule of Object.keys(fields[field])) {
                if (!(rule in rules) && !(customRules && rule in customRules)) {
                    errors.push(`${field}: ${rule} isn't a valid rule.`)
                }
            }
        }

        if (errors.length > 0) {
            throw new Error(`[validator] error: an error occured during schema configuration: ${errors.join('\n')}`)
        }
    }

    /**
     * Use this method to create a new instance of Schema.
     * @param fields 
     * @returns 
     */
    public static async create(fields: Fields) {
        const customRules = await rules.importCustomRules()
        return new Schema(fields, customRules)
    }

    public async parse<T>(data: {[key: string]: string | number}): Promise<ParsingResult<T>> {
        let errors: {[key: string]: string | number} = {}

        for (const field of Object.keys(this.fields)) {
            if (data[field]) {
                for (const ruleName of Object.keys(this.fields[field])) {
                    const rule = await getRule(ruleName, data[field], ...this.fields[field][ruleName])
                    const result = rule.cb()

                    /** 
                     * If the rule callback returns a string or a number, it's a rule that transforms the value,
                     * so we need to return the initial value.
                     */
                    if (typeof result !== "boolean") {
                        data[field] = result
                    }

                    if (!result) {
                        errors[field] += `Invalid ${field}: ${rule.errMsg}`
                    }
                }
            } else {
                /** if the not found field isn't optional */
                if (Object.keys(this.fields[field]).includes("optional")) {

                    /** try to get the default value and set it if found */
                    if (this.fields[field]["optional"][0]) {

                        const rule = rules.optional("", this.fields[field]["optional"][0].toString())
                        data[field] = rule.cb() as (string | number)

                    } else {
                        data[field] = ""
                    }
                } else {
                    errors[field] = `${field} needed but not obtained.`
                }
            }
        }

        if (Object.keys(errors).length > 0) return { success: false, data: errors as T }

        return { success : true, data: data as T }
    }

    /** getters */

    public getFields() {
        return this.fields
    }

    public getField(fieldName: string) {
        return this.fields[fieldName]
    }
}
