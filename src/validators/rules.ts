import type { Rule } from "@validator"

export const myCustomMin = (str: string) => {
    return {
        name: "Custom minimum string length",
        errMsg: "The string isn't long enough (custom rule)",
        cb: () => {
            if (str.length >= 8) return true

            return false
        }
    } as Rule
}
