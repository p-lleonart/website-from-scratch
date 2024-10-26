import { BaseModel } from "./base-model"
import { Column } from "./types"

export const handler: ProxyHandler<BaseModel> = {
    get (target: BaseModel, key: string, receiver: any) {
        const col = target._getTable().getColumns().filter(col => col.name === key)[0]

        if (col) {  // case key is an attribute
            return target._getData(key)
        }

        // case key isn't an attribute
        return Reflect.get(target, key, receiver)
    },
    set (target: BaseModel, key: string, value: string | number, receiver: any) {
        const col = target._getTable().getColumns().filter((col: Column) => col.name === key)[0]

        if (col) {
            target._setData(key, value)
            return true
        }

        return Reflect.set(target, key, value, receiver)
    }
}
