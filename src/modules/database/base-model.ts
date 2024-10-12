import { escapeValue } from "./helpers"
import { Table } from "./table"
import type { ModelObject, Operator, Serialize } from "./types"

export abstract class BaseModel {
    public static table: Table

    constructor() {}

    public static async create(options: ModelObject) {
        return this.table.add(options)
    }

    public static async find(id: string | number, idCol: string = 'id'): Promise<ModelObject | undefined> {
        let result
        try {
            result = await this.table.get({ colName: idCol, value: `${id}` })
        } catch (err) {
            console.error(`[database] error: BaseModel.find() : ${err}`)
        }
        return result as ModelObject
    }

    public static async findBy(key: string, value: string, operator: Operator = '='): Promise<ModelObject[]> {
        let result: ModelObject[] = []
        try {
            result = await this.table.getBy(`${escapeValue(key)} ${operator} '${escapeValue(value)}'`)
        } catch (err) {
            console.error(`[database] error: BaseModel.findBy() : ${(err as Error).message}`)
        }
        return result
    }

    public static async findMany(key: string, value: string, operator: Operator = '='): Promise<ModelObject[]> {
        return this.findBy(key, value, operator)
    }

    /** 
     * WARNING: this is not fully implemented.
     */
    public static async findWithSql(condition: string): Promise<ModelObject[]> {
        return this.table.getBy(condition)
    }

    public static async findAll(): Promise<ModelObject[]> {
        return this.table.getAll()
    }

    /**
     * Serialize an object with the specified fields.
     * @param model 
     * @param fields 
     * @param idCol not mandatory, default: 'id'
     * @returns 
     */
    public static async serialize(model: string | number | ModelObject, fields: Serialize, idCol: string = 'id'): Promise<ModelObject | undefined> {
        /** if model is an id, get the item from db */
        if (!(model instanceof Object)) {
            const _model = await this.find(model)

            if(!_model) {
                console.error(`[database] error: cannot serialize this item because it doesn't exist in the database. Please create it before.`)
                return
            }

            model = _model
        }

        return Object.keys(model).reduce<ModelObject>((result, key) => {
            if(fields[key] && model[key]) {
                const field = fields[key]
                const serializeAs = field.serializeAs
                const serializedValue = field.doSerialize
                    ? field.doSerialize(model[key])
                    : model[key]
                
                result[serializeAs ? serializeAs : key] = serializedValue
                return result
            }
            
            if(!model[key]) {
                console.error(`[database] error: ${key} isn't an attribute of this model`)
                return result
            }

            return result
        }, {} as ModelObject)
    }

    /** save the item in the db after update */
    public static async save(id: string | number, newItem: ModelObject, idCol: string = 'id') {
        const itemFromDb = await this.find(id)
        
        if(!itemFromDb) {
            console.error(`[database] error: cannot save this item because it doesn't exist in the database. Please use item.create(...) instead.`)
            return
        }

        return this.table.update({ colName: idCol, value: `${id}` }, newItem)
    }

    /** deletes the item in db */
    public static async destroy(id: string | number, idCol: string = 'id') {
        const itemFromDb = await this.find(id)
        
        if(!itemFromDb) {
            console.error(`[database] error: cannot destroy this item because it doesn't exist in the database.`)
            return
        }

        return this.table.delete({ colName: idCol, value: `${id}` })
    }
}
