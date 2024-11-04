import { DBHandler } from "./db-handler"
import { existsSync, readFileSync, writeFileSync } from "fs"
import { Table } from "./table"
import { MigrationActions } from "./types"

export default abstract class BaseMigration {
    protected abstract table: Table
    protected abstract tableName: string
    public static migrationsFilePath: string = "migrations.json"

    constructor(protected dbHandler: DBHandler) {}

    public getTable() {
        return this.table
    }

    /** create/alter table */
    public async up() {}

    /** delete/alter back table */
    public async down() {}

    public static runMigration(migrationName: string, migration: BaseMigration): void {
        /** 
         * the mode can be set from command line interface by writing `{tableName}={mode}` after the `migrate` 
         * script
         */
        let mode: MigrationActions

        /**
         * if there's no other params specified, up all migrations not runned, else, run only the migrations
         * in args (depending on their mode).
         */

        if(process.argv.length === 2) {  // process.argv has two args (nodejs path and dist/main.js path)
            mode = BaseMigration.checkIfMigrationWasAlreadyRunned(migrationName)
        } else {
            mode = process.argv.includes(`${migrationName}=down`) 
                ? "down"
                : process.argv.includes(`${migrationName}=up`)
                    ? "up"
                    : "pass"
        }
        
        try {
            switch (mode) {
                case "up":
                    migration.up()
                    BaseMigration.saveMigrationRunned(migrationName, "up")
                    console.log(`[database] info: migration ${migrationName} successfully applied.`)
                    break
                case "down":
                    migration.down()
                    BaseMigration.saveMigrationRunned(migrationName, 'down')
                    console.log(`[database] info: migration ${migrationName} successfully downed.`)
                    break
            }
        } catch (e: any) {
            console.error(`[database] error: an error occurred during ${migrationName} migration running: ${e.message}`)
        }
    }

    private static checkIfMigrationWasAlreadyRunned(migrationName: string): MigrationActions {
        return this.fetchMigrationsFile().includes(migrationName) ? "pass" : "up"
    }

    private static fetchMigrationsFile(): string[] {
        const migrationFilePath = BaseMigration.migrationsFilePath
        if (existsSync(migrationFilePath))
            return JSON.parse(readFileSync(migrationFilePath, { encoding: "utf8" }))
        else {
            writeFileSync(migrationFilePath, "[]")
            return []
        }
    }

    private static saveMigrationRunned(migrationName: string, action: MigrationActions): void {
        const migrationFilePath = BaseMigration.migrationsFilePath
        let migrationsRunned = this.fetchMigrationsFile()

        if (action === "up") {
            migrationsRunned.push(migrationName)
        } else if (action === "down") {
            migrationsRunned = migrationsRunned.filter(m => m !== migrationName)
        }
        
        writeFileSync(migrationFilePath, JSON.stringify(migrationsRunned, undefined, "  "))
    }
}
