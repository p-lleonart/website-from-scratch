import type { CreateTable } from "./types"


export function getCreateTableSqlScript(table: CreateTable) {
    let q = `CREATE TABLE IF NOT EXISTS ${table.name} (`

    for (const col of table.columns) {
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
