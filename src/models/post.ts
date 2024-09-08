import { BaseModel } from "../database/base-model"
import { DBHandler } from "../database/db-handler"
import { Table } from "../database/table"

import { AddPostMigration } from "../migrations/add_post"

const dbHandler = new DBHandler(process.env.DATABASE_NAME ? process.env.DATABASE_NAME : "database.sqlite")

export class Post extends BaseModel {
    public static table: Table = (new AddPostMigration(dbHandler)).getTable()
}
