import { BaseMigration, CreateTable, provider, Table } from "#database"


export class AddPostMigration extends BaseMigration {
    protected table: Table = {
        name: "posts",
        columns: [
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
        ]
    }

    public async up() {
        provider.createTable(this.table as CreateTable)
    }

    public async down() {
        provider.dropTable(this.table)
    }
}
