import { BaseMigration, DBHandler, Table } from "@database"

export default class AddCsrfTokenMigration extends BaseMigration {
    protected tableName = "csrf_tokens"
    protected table = new Table(this.dbHandler.getDbPath(), this.tableName, [
        {
            name: "id",
            type: "TEXT",
            isNotNull: true,
            isUnique: true,
            isPrimaryKey: true,
        },
        {
            name: "token",
            type: "TEXT",
            isNotNull: true
        },
        {
            name: "expires",
            type: "INTEGER",
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
