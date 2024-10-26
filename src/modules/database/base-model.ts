import { escapeValue } from "./helpers"
import { handler } from "./proxy-handler"
import { Table } from "./table"
import type { ModelObject, Operator, Serialize } from "./types"


export class BaseModel {
    protected data: ModelObject = {}
    protected idCol: string = 'id' // to change if you want to use another name
    public static table: Table

    constructor() {
        return new Proxy(this, handler)
    }

    public static async create(options: ModelObject) {
        const model = new this()
        model._setDatas(await model._getTable().add(options))
        return model
    }

    public static async find(id: string | number): Promise<BaseModel | undefined> {
        const model = new this()
        let result
        try {
            result = await model._getTable().get({ colName: model.idCol, value: `${id}` })
        } catch (err) {
            console.error(`[database] error: BaseModel.find() : ${err}`)
            return undefined
        }
        model._setDatas(result)
        return model
    }

    public static async findBy(key: string, value: string, operator: Operator = '='): Promise<BaseModel[]> {
        const model = new this()
        let models: BaseModel[] = []
        let results: ModelObject[] = []

        try {
            results = await model._getTable().getBy(`${escapeValue(key)} ${operator} '${escapeValue(value)}'`)
        } catch (err) {
            console.error(`[database] error: BaseModel.findBy() : ${(err as Error).message}`)
            return []
        }
        
        for (const result of results) {
            const _model = new this()
            _model._setDatas(result)
            models.push(_model)
        }

        return models
    }

    /** 
     * WARNING: this is not fully implemented.
     */
    public static async findWithSql(condition: string): Promise<BaseModel[]> {
        let models = []
        const model = new this()
        const results = await model._getTable().getBy(condition)

        for (const result of results) {
            const _model = new this()
            _model._setDatas(result)
            models.push(_model)
        }

        return models
    }

    public static async findAll(): Promise<BaseModel[]> {
        let models = []
        const model = new this()
        const results = await model._getTable().getAll()

        for (const result of results) {
            const _model = new this()
            _model._setDatas(result)
            models.push(_model)
        }

        return models
    }

    /**
     * Serialize an object with the specified fields.
     * @param fields 
     * @returns 
     */
    public serialize(fields: Serialize): ModelObject | undefined {
        return Object.keys(this.data).reduce<ModelObject>((result, key) => {
            if(fields[key] && this.data[key]) {

                const field = fields[key]
                const serializeAs = field.serializeAs
                const serializedValue = field.doSerialize
                    ? field.doSerialize(this.data[key])
                    : this.data[key]
                
                result[serializeAs ? serializeAs : key] = serializedValue
                return result
            }
            
            if(!this.data[key]) {
                console.error(`[database] error: ${key} isn't an attribute of this model`)
                return result
            }

            return result
        }, {} as ModelObject)
    }

    public toObject(): ModelObject {
        return this.data
    }

    public toJson() {
        return JSON.stringify(this.data)
    }

    /** save the item in the db after update */
    public async save(): Promise<void> {
        this._getTable().update(
            { colName: this.idCol, value: `${this.data[this.idCol]}` },
            this.data
        )
    }

    /** deletes the item in db */
    public async destroy() {
        this._getTable().delete({ colName: this.idCol, value: `${this.data[this.idCol]}` })
    }

    /**
     * INTERNAL METHODS
     * 
     * The methods below (that the name begins by `_`) shouldn't be used by the developer in other places than
     * models, please use `model.attr` instead (use the proxy).
     */
    public _setDatas(model: ModelObject) {
        this.data = model
    }

    public _setData(key: string, value: string | number) {
        this.data[key] = value
    }

    public _getData(key: string) {
        return this.data[key]
    }

    public _getTable() {
        return (this.constructor as typeof BaseModel).table
    }
}
