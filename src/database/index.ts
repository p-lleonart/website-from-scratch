/**
 * DISCLAMER: here I use a third-party library (`sqlite3`) but NodeJS plans to add an equivalent on next
 * versions (aka node v22).
 * 
 * The current LTS version of NodeJS at this time is the v20.17.0.
 * 
 * Maybe I'll do the refactor when the v22 will be LTS.
 */

import { BaseModel } from "./base-model"
import { DBHandler } from "./db-handler"
import { verifyCreateTableParams, getColumnsAsString, escapeValue } from "./helpers"
import { BaseMigration, runMigration } from "./migrations"
import { Table } from "./table"
import type {
    Column,
    DBHandlerInterface,
    ModelObject,
    Operator,
    SqlOperator,
    PrimaryKey,
    AlterTable,
    Serialize
} from "./types"

export {
    BaseModel,
    DBHandler,
    verifyCreateTableParams,
    getColumnsAsString,
    escapeValue,
    BaseMigration,
    runMigration,
    Table,
    Column,
    DBHandlerInterface,
    ModelObject,
    Operator,
    SqlOperator,
    PrimaryKey,
    AlterTable,
    Serialize
}
