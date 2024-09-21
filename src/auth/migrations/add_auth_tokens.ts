import { DBHandler } from "../../database/db-handler"
import { BaseMigration } from "../../database/migrations"
import { Table } from "../../database/table"

export class AddAuthTokenMigration extends BaseMigration {
    protected tableName = "auth_tokens"
    protected table = new Table(this.dbHandler.getDbPath(), this.tableName, [
        {
            name: 'id',
            type: 'TEXT',
            isNotNull: true,
            isPrimaryKey: true,
            isUnique: true
        },
        {
            name: 'userId',
            type: 'TEXT',
            isNotNull: true,
            isUnique: true
        },
        {
            name: 'token',
            type: 'TEXT',
            isNotNull: true,
        },
        {
            name: 'expires',
            type: 'INTEGER', // timestamp
            isNotNull: true
        }
    ])

    constructor(dbHandler: DBHandler) {
        super(dbHandler)
    }

    public async up() {
        this.dbHandler.createTable(this.table)
    }

    public async down() {
        this.dbHandler.dropTable(this.tableName)
    }
}
