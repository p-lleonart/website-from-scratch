import type { Rule } from "./types"


/** importing custom rules */

export async function importCustomRules() {
    try {
        return await import("../../validators/rules.js")
    } catch (err) {  /** no custom rules set */
    }
}


/** STRING RULES */

export const min = (str: string, min: number) => {
    return {
        name: `Text isn't long enough, excepted a ${min} characters minimum text`,
        errMsg: "Too short",
        cb: () => {
            if (str.length >= min) return true

            return false
        }
    } as Rule
}

export const max = (str: string, max: number) => {
    return {
        name: `Text isn't short enough, excepted a ${max} characters maximum text`,
        errMsg: "Too long",
        cb: () => {
            if (str.length <= max) return true

            return false
        }
    } as Rule
}

export const email = (str: string) => {
    return {
        name: "Email string",
        errMsg: "Invalid email",
        cb: () => {
            const regex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/

            return regex.test(str)
        }
    } as Rule
}

export const optional = (str: string, defaultStr?: string) => {
    return {
        name: "Optional string",
        errMsg: "",
        cb: () => {
            return str ? str : ( defaultStr ? defaultStr : null)
        }
    } as Rule
}

/** NUMBER RULES */

export const greaterThan = (x: number, y: number, strict: boolean = true) => {
    return {
        name: "Number greater than another",
        errMsg: `Number isn't great enough, excepted greater than ${y}`,
        cb: () => {
            return strict ? x > y : x >= y
        }
    } as Rule
}

export const lowerThan = (x: number, y: number, strict: boolean = true) => {
    return {
        name: "Number lower than another",
        errMsg: `Number isn't small enough, excepted lower than ${y}`,
        cb: () => {
            return strict ? x < y : x <= y
        }
    } as Rule
}
