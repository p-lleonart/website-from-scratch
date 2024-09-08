import { Database } from "sqlite3"

import { Table } from "./table"
import { AlterTable, DBHandlerInterface } from "./types"
import { getColumnsAsString, verifyCreateTableParams } from "./helpers"

export class DBHandler implements DBHandlerInterface {
    protected db?: Database = undefined

    constructor (
        protected dbPath: string
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

    /** Returns the SQL script that permits to create a table. Usage in `this.createTable()` and in `this.alterTable()`. */
    protected getCreateTableSqlScript(table: Table) {
        let q = `CREATE TABLE IF NOT EXISTS ${table.getName()} (`

        for (const col of table.getColumns()!) {
            q += `${col.name}
                ${col.type} 
                ${col.isPrimaryKey ? 'PRIMARY KEY' : ''} 
                ${col.isUnique ? 'UNIQUE' : ''} 
                ${col.isNotNull ? 'NOT NULL' : ''} 
                ${col.isAutoIncrement ? 'AUTOINCREMENT' : ''} 
                ${col.default ? `DEFAULT ${col.default}` : ''}, `
        }

        q = q.slice(0, q.length - 2)
        q += ");"

        return q
    }
    
    public createTable (table: Table) {
        this.db = this.connectDb(this.dbPath)

        verifyCreateTableParams(table)

        const q = this.getCreateTableSqlScript(table)
        this.db.serialize(() => {
            this.db!.run(q)
        })

        this.closeConnection()
    }

    /** if you use it, we hope that you know what you're doing */
    public dropTable (tableName: string) {
        this.db = this.connectDb(this.dbPath)
        
        this.db.serialize(() => {
            this.db!.run(`DROP TABLE ${tableName};`)
        })
        
        this.closeConnection()
    }

    /**
     * Nota: if you want to override the table name, set the ``newTable.name``.
     * If you want to edit a column, you have to completly rewrite all of them (yet).
     * 
     * Warning: this is not fully implemented yet
     * @param {string} tableName
     * @param {AlterTable} newTable
     */
    public alterTable(tableName: string, newTable: AlterTable) {
        this.db = this.connectDb(this.dbPath)
        
        if (newTable.name) {
            this.db.serialize(() => {
                this.db!.run(`ALTER TABLE ${tableName} RENAME TO ${newTable.name};`)
            })
            tableName = newTable.name
        }

        if (newTable.columns) {
            const tempTable = new Table(this.dbPath, tableName, [ ...newTable.columns ])
            const cols = getColumnsAsString(tempTable.getColumns())
            this.db.serialize(() => {
                this.db!.run(`
                    BEGIN TRANSACTION;

                    ${this.getCreateTableSqlScript(tempTable)}

                    INSERT INTO TEMP_${tableName}(${cols})
                    SELECT ${cols}
                    FROM ${tableName};

                    DROP TABLE ${tableName};

                    ALTER TABLE TEMP_${tableName} RENAME TO ${tableName}; 

                    COMMIT;`
                )
            })
        }
        
        this.closeConnection()
    }
}
