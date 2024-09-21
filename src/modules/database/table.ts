import { Database } from "sqlite3"

import { getColumnsAsString } from "./helpers"
import type { Column, DBHandlerInterface, ModelObject, PrimaryKey } from "./types"

export class Table implements DBHandlerInterface {
    private db?: Database

    constructor (
        private dbPath: string,
        private name: string,
        private columns: Column[]
    ) {}

    public getDb() {
        return this.db
    }

    public getDbPath() {
        return this.dbPath
    }
    
    public connectDb (dbPath: string) {
        return new Database(dbPath, err => {
            if (err) {
                console.error(`[database] error: cannot connect ${dbPath} database : ${err.name} : ${err.message}`)
            }
        })
    }
    
    public closeConnection() {
        if(!this.db) return

        this.db.close((err) => {
            if (err) {
                console.error(`[database] error: cannot close connection with ${this.dbPath} : ${err.message}`)
            }
        })
    }

    public getName() {
        return this.name
    }

    public getColumns() {
        return this.columns
    }

    /**
     * Get all rows of the table.
     * @returns
     */
    public async getAll(): Promise<ModelObject[]> {
        return new Promise((resolve, reject) => {
            this.db = this.connectDb(this.dbPath)

            this.db.all(`SELECT * FROM ${this.name}`, (err, rows) => {
                if (err) {
                    console.error(`[database] error: ${err.name} : ${err.message}`)
                }
    
                if (rows) {
                    resolve(rows as ModelObject[])
                } else {
                    reject("[database] error: rows undefined")
                }
            })

            this.closeConnection()
        })
    }

    /**
     * Get one item by its primary key.
     * @param primaryKey
     */
    public async get(primaryKey: PrimaryKey): Promise<ModelObject> {
        return new Promise((resolve, reject) => {
            this.db = this.connectDb(this.dbPath)

            this.db.serialize(() => {
                const q = `SELECT * FROM ${this.name} WHERE ${primaryKey.colName} = ?`

                this.db!.all(q, [primaryKey.value], (err, rows) => {
                    if (err) {
                        console.error(`[database] error: ${err.name} : ${err.message}`)
                    }

                    if (rows[0]) {
                        resolve(rows[0] as ModelObject)
                    } else {
                        reject("[database] error: row undefined")
                    }
                })
            })

            this.closeConnection()
        })
    }

    /**
     * Get items with a specified condition.
     * @param condition You must specify a SQL format string that will be added to the query
     * `SELECT * FROM {table} WHERE {yourCondition}`.
     * 
     * Warning: please escape user's inputs to avoid SQL injections.
     * @returns 
     */
    public async getBy(condition: string): Promise<ModelObject[]> {
        return new Promise((resolve, reject) => {
            this.db = this.connectDb(this.dbPath)

            this.db.all(`SELECT * FROM ${this.name} WHERE ${condition}`, (err, rows) => {
                if (err) {
                    console.error(`[database] error: ${err.name} : ${err.message}`)
                }
    
                if (rows) {
                    resolve(rows as ModelObject[])
                } else {
                    reject("[database] error: row undefined")
                }
            })

            this.closeConnection()
        })
    }

    public async add(item: Object): Promise<ModelObject> {
        return new Promise((resolve, reject) => {
            this.db = this.connectDb(this.dbPath)

            let questionMarks = ''
    
            this.columns.forEach(() => questionMarks += "?,")
            questionMarks = questionMarks.slice(0, questionMarks.length - 1)

            const stmt = `INSERT INTO ${this.name} (${getColumnsAsString(this.columns)}) VALUES (${questionMarks})`
    
            this.db.serialize(() => {
                const stmtSql = this.db!.prepare(stmt)
    
                stmtSql.run(...Object.values(item))
                stmtSql.finalize()
            })
            
            this.closeConnection()
            resolve(item as ModelObject)
        })
    }

    public async update(itemPrimaryKey: PrimaryKey, newItem: ModelObject): Promise<ModelObject> {
        return new Promise(async (resolve, reject) => {
            this.db = this.connectDb(this.dbPath)

            let q = `UPDATE ${this.name} SET `

            Object.keys(newItem).forEach(key => {
                q += `${key} = ?,`
            })

            /** remove the useless comma at the end */
            q = q.slice(0, q.length - 1)

            q += ` WHERE ${itemPrimaryKey.colName} = ?`

            this.db.serialize(() => {
                this.db!.run(q, [...Object.values(newItem), itemPrimaryKey.value], function(err) {
                    if (err) {
                        throw Error(`[database] error: ${err.name} : ${err.message}`)
                    }
                })
            })

            this.closeConnection()

            const editedItem = await this.get(itemPrimaryKey)
            resolve(editedItem)
        })
    }

    public async delete(itemPrimaryKey: PrimaryKey): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db = this.connectDb(this.dbPath)
            this.db.serialize(() => {
                this.db!.run(`DELETE FROM ${this.name} WHERE ${itemPrimaryKey.colName} = ?`, [itemPrimaryKey.value], (err) => {
                    if (err) {
                        console.error(`[database] error: ${err.name} : ${err.message}`)
                        reject(`[database] error: ${err.name} : ${err.message}`)
                    }
                })
            })
            
            this.closeConnection()
            resolve(undefined)
        })
    }
}
