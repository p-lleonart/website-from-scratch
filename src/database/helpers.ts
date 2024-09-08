import { Table } from "./table"
import { Column } from "./types"

export function verifyCreateTableParams (table: Table) {
    let primaryKeyColName = null

    for (const col of table.getColumns()) {
        if (col.isAutoIncrement && col.type !== "INTEGER") {
            throw Error(`[database] error: the ${col.name} column of the ${table.getName()} table can't be autoincremented and have a type different than 'INTEGER'.`)
        }
        if (col.isPrimaryKey) {
            if (primaryKeyColName) {
                throw Error(`[database] error: there are at least two columns that are primary keys for ${table}: ${primaryKeyColName} and ${col.name}`)
            }
            primaryKeyColName = table.getName()
        }
    }

    if (!primaryKeyColName) throw Error(`[database] error: there are no primary key column set for the ${table.getName()} table.`)
    
    return true
}

export function getColumnsAsString(cols: Column[]) {
    let colsNames: string[] = []
    cols.forEach(col => colsNames.push(col.name))
    return colsNames.join(', ')
}

/**
 * Warning: this is not 100% secure
 * @param str 
 * @returns 
 */
export function escapeValue(str: string) {
    return str.split('--').join('').replace('`', "'")
}
