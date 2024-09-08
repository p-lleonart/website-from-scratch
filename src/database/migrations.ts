import { DBHandler } from "./db-handler"
import { Table } from "./table"

export abstract class BaseMigration {
    protected abstract table: Table
    protected abstract tableName: string

    constructor(protected dbHandler: DBHandler) {}

    getTable() {
        return this.table
    }

    /** create/alter table */
    public async up() {}

    /** delete/alter back table */
    public async down() {}
}

export function runMigration(migrationName: string, migration: BaseMigration) {
    /** 
     * the mode can be set from command line interface by writing `{tableName}={mode}` after the `migrate` 
     * script
     */
    const mode = process.argv.includes(`${migrationName}=down`) 
        ? "down"
        : process.argv.includes(`${migrationName}=up`)
            ? "up"
            : "pass"

    if (mode === "up") {
        migration.up()
    } else if (mode === "down") {
        migration.down()
    }
}
