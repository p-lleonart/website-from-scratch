import { BaseModel } from "#database"

import { AddPostMigration } from "#app/migrations/add_post"


export class Post extends BaseModel {
    public static table = (new AddPostMigration()).getTable()

    declare id: string

    declare title: string

    declare content: string
}
