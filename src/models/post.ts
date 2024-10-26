import { BaseModel, DBHandler, Table } from "@database"

import { AddPostMigration } from "@/migrations/add_post"

const dbHandler = new DBHandler(process.env.DATABASE_NAME ? process.env.DATABASE_NAME : "database.sqlite")

export class Post extends BaseModel {
    public static table: Table = (new AddPostMigration(dbHandler)).getTable()

    declare id: string

    declare title: string

    declare content: string
}
