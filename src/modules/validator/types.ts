
export type Field = (string | number)[]

export type Fields = Record<string, Record<string, Field>>

export type ParsingResult<T> = {
    success: boolean
    /**
     * If the parsing is a success, it returns the data, else, it returns the list of errors.
     */
    data: T
}

export type Rule = {
    name: string
    errMsg: string
    cb: () => boolean | string | number
}
