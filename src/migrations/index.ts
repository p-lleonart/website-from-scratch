import { DBHandler } from "../database/db-handler"
import { runMigration } from "../database/migrations"

import { AddPostMigration } from "./add_post"

const dbHandler = new DBHandler(process.env.DATABASE_NAME ? process.env.DATABASE_NAME : "database.sqlite")
const migrations: any = {
    'add_post': new AddPostMigration(dbHandler)
}

Object.keys(migrations).forEach(key => runMigration(key, migrations[key]))
