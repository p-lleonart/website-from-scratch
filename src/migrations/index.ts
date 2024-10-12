import 'module-alias/register'

import { BaseMigration, DBHandler } from "@database"

import { AddPostMigration } from "./add_post"
import { AddAuthTokenMigration } from "@auth/migrations/add_auth_tokens"
import { AddUserMigration } from "@auth/migrations/add_users"
import { AddCsrfTokenMigration } from "@csrf-shield"

const dbHandler = new DBHandler(process.env.DATABASE_NAME ? process.env.DATABASE_NAME : "database.sqlite")
const migrations: any = {
    'add_post': new AddPostMigration(dbHandler),
    'add_user': new AddUserMigration(dbHandler),
    'add_auth_token': new AddAuthTokenMigration(dbHandler),
    'add_csrf_token': new AddCsrfTokenMigration(dbHandler),
}

Object.keys(migrations).forEach(key => BaseMigration.runMigration(key, migrations[key]))
