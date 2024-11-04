import { Database } from "sqlite3"

export type Column = {
    name: string
    /** type of the contained value */
    type: 'TEXT' | 'INTEGER' | 'NULL' | 'REAL' | 'BLOB'
    default?: string
    isAutoIncrement?: boolean
    isNotNull?: boolean
    isPrimaryKey?: boolean
    isUnique?: boolean
}

export interface DBHandlerInterface {
    connectDb(dbPath: string): Database
    closeConnection(): void
    getDb(): Database | undefined
    getDbPath(): string
}

export type ModelObject = {
    [key: string]: string | number
}

export type Operator = '=' | '<>' | '!=' | '<' | '>' | '<=' | '>='

export type SqlOperator = Operator | 'ALL' | 'AND' | 'ANY' | 'BETWEEN' | 'EXISTS' | 'IN' | 'LIKE' | 'NOT' | 'OR'

export type MigrationActions = 'up' | 'down' | 'pass'

export type PrimaryKey = {
    colName: string
    value: string
}

export type AlterTable = {
    name?: string,
    columns?: Column[]
}

export type Serialize = {
    [keys: string]: {
        serializeAs?: string
        doSerialize?: (value: string | number) => string
    }
}
