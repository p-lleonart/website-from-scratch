import { BaseMigration } from "#database"

import { AddPostMigration } from "./add_post"
import { AddAuthTokenMigration } from "#auth/migrations/add_auth_tokens"
import { AddUserMigration } from "#auth/migrations/add_users"


const migrations: any = {
    'add_post': new AddPostMigration(),
    'add_user': new AddUserMigration(),
    'add_auth_token': new AddAuthTokenMigration(),
}

Object.keys(migrations).forEach(key => BaseMigration.runMigration(key, migrations[key]))
