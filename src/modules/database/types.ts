
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

export type ModelObject = Record<string, string | number>

export type Operator = '=' | '<>' | '!=' | '<' | '>' | '<=' | '>='

export type SqlOperator = Operator | 'ALL' | 'AND' | 'ANY' | 'BETWEEN' | 'EXISTS' | 'IN' | 'LIKE' | 'NOT' | 'OR'

export type MigrationActions = 'up' | 'down' | 'pass'

export type PrimaryKey = {
    colName: string
    value: string
}

export type Table = {
    name: string,
    columns?: Column[]
}

export type Conditions = Record<string, string>

export type CreateTable = {
    name: string,
    columns: Column[]
}

export type AlterTable = {
    name: string,
    newName?: string,
    columns?: Column[]
}

type SerializeItem = {
    serializeAs?: string
    doSerialize?: (value: string | number) => string
}

export type Serialize = Record<string, SerializeItem>

export interface DatabaseProviderInterface {
    connectDb(dbPath: string): void
    closeConnection(): void
    get db(): any | undefined
    get dbPath(): string
    
    createTable: (table: CreateTable) => void
    alterTable: (table: AlterTable) => void
    dropTable: (table: Table) => void

    query (table: Table): any
    select <T extends ModelObject> (table: Table, condition: Conditions): Promise<T[]>
    insert <T extends ModelObject> (table: Table, value: T): Promise<T>
    update <T extends ModelObject> (table: Table, condition: Conditions, value: T): Promise<T>
    delete <T extends ModelObject> (table: Table, condition: Conditions): Promise<T[]>
}
