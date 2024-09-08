import { DBHandler } from "../database/db-handler"
import { BaseMigration } from "../database/migrations"
import { Table } from "../database/table"

export class AddPostMigration extends BaseMigration {
    protected tableName = "posts"
    protected table = new Table(this.dbHandler.getDbPath(), this.tableName, [
        {
            name: 'id',  // Nota: I won't use autoincrement to handle ids in this example
            type: 'INTEGER',
            isNotNull: true,
            isPrimaryKey: true,
            isUnique: true
        },
        {
            name: 'title',
            type: 'TEXT',
            isNotNull: true
        },
        {
            name: 'content',
            type: 'TEXT',
            isNotNull: true,
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
