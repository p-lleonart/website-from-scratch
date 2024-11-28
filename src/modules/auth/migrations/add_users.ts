import { BaseMigration, CreateTable, provider, Table } from "#database"


export class AddUserMigration extends BaseMigration {
    protected tableName = "users"
    protected table: Table = {
        name: "users",
        columns: [
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
        ]
    }

    public async up() {
        provider.createTable(this.table as CreateTable)
    }

    public async down() {
        provider.dropTable(this.table)
    }
}
