import Knex from "knex"

import { CONFIG } from "#app/config"
import { getCreateTableSqlScript } from "#database/helpers"
import { AlterTable, CreateTable, DatabaseProviderInterface, Table, ModelObject, Conditions } from "#database/types"
import sqlite from "sqlite3"


const knex = Knex({
    client: 'sqlite3',
    connection: {
        filename: `file:${CONFIG.modules.database.PATH}`,
        flags: ['OPEN_URI', 'OPEN_SHAREDCACHE'],
    },
})

export default class SQLiteDatabaseProvider implements DatabaseProviderInterface {
    private _db?: sqlite.Database
    private _dbPath: string = CONFIG.modules.database.PATH

    get db() {
        return this._db
    }

    get dbPath() {
        return this._dbPath
    }
    
    public connectDb () {
        this._db = new sqlite.Database(this.dbPath, err => {
            if (err) {
                throw new Error(`[database] error: cannot connect ${this.dbPath} database : ${err.name} : ${err.message}`)
            }
        })
    }
    
    public closeConnection() {
        if(!this._db) return

        this._db.close((err) => {
            if (err) {
                throw new Error(`[database] error: cannot close connection with ${this.dbPath} : ${err.message}`)
            }
        })
    }

    public async query (table: Table) {
        return knex(table.name)
    }

    public createTable (table: CreateTable): void {
        this.connectDb()

        const q = getCreateTableSqlScript(table)
        this._db!.serialize(() => {
            this.db!.run(q)
        })

        this.closeConnection()
    }

    /**
     * Not implemented yet
     */
    public alterTable (table: AlterTable): void {
        throw new Error("[database] error: not implemented yet.")
    }

    public dropTable (table: Table): void {
        this.connectDb()
        
        this._db!.serialize(() => {
            this._db!.run(`DROP TABLE ${table.name};`)
        })
        
        this.closeConnection()
    }

    public async select<T extends ModelObject> (table: Table, condition: Conditions = {}): Promise<T[]> {
        const conditionsCols = Object.keys(condition)
        const conditionsVals = Object.values(condition)

        if (conditionsCols.length > 0) {
            let q = knex(table.name)
                .select(table.columns ?? '*')
                .where(conditionsCols[0], conditionsVals[0])
            
            for (let i = 1; i < conditionsCols.length; i++) {
                q = q.andWhere(conditionsCols[i], conditionsVals[i])
            }

            return await q
        }

        return await knex(table.name).select(table.columns ?? '*') as T[]
    }

    public async insert<T extends ModelObject> (table: Table, value: T): Promise<T> {
        await knex(table.name).insert(value)
        return value
    }

    public async update<T extends ModelObject> (table: Table, condition: Conditions, value: T): Promise<T> {
        const conditionsCols = Object.keys(condition)
        const conditionsVals = Object.values(condition)

        if (conditionsCols.length > 0) {
            let q = knex(table.name)
                .update(value)
                .where(conditionsCols[0], conditionsVals[0])
            
            for (let i = 1; i < conditionsCols.length; i++) {
                q = q.andWhere(conditionsCols[i], conditionsVals[i])
            }

            await q

            return value
        }

        return await new Promise((_, reject) => reject("[database] error: you must specify conditions for editing your rows."))
    }

    public async delete<T extends ModelObject> (table: Table, condition: Conditions): Promise<T[]> {
        const conditionsCols = Object.keys(condition)
        const conditionsVals = Object.values(condition)

        if (conditionsCols.length > 0) {
            const q = knex(table.name)
                .where(conditionsCols[0], conditionsVals[0])
            
            for (let i = 1; i < conditionsCols.length; i++) {
                q.andWhere(conditionsCols[i], conditionsVals[i])
            }

            return await q.del() as T[]
        }
        
        return await knex(table.name).del() as T[]
    }
}
