import { DBHandler } from "../../database/db-handler"
import { BaseMigration } from "../../database/migrations"
import { Table } from "../../database/table"

export class AddUserMigration extends BaseMigration {
    protected tableName = "users"
    protected table = new Table(this.dbHandler.getDbPath(), this.tableName, [
        {
            name: 'id',
            type: 'TEXT',
            isNotNull: true,
            isPrimaryKey: true,
            isUnique: true
        },
        {
            name: 'name',
            type: 'TEXT',
            isNotNull: true
        },
        {
            name: 'email',
            type: 'TEXT',
            isNotNull: true,
            isUnique: true
        },
        {
            name: 'password',
            type: 'TEXT',
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
