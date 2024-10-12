import { randomBytes } from "crypto"
import { BaseModel, DBHandler, ModelObject, Table } from "@database"
import { env } from "@/env"
import AddCsrfTokenMigration from "@csrf-shield/migrations/add_csrf_tokens"
import { randomId } from "@/helpers"


const CSRF_TOKEN_EXPIRES = parseInt(env.CSRF_TOKEN_EXPIRES, 10)

const dbHandler = new DBHandler(env.DATABASE_NAME ? env.DATABASE_NAME : "database.sqlite")

export default class CsrfToken extends BaseModel {
    public static table: Table = (new AddCsrfTokenMigration(dbHandler)).getTable()

    public static async create(): Promise<ModelObject> {
        const id = randomId("rq_")
        const token = randomBytes(32).toString('hex')

        return this.table.add({
            id,
            token,
            expires: Date.now() + CSRF_TOKEN_EXPIRES
        })
    }

    public static async find(id: string): Promise<ModelObject | undefined> {
        const csrfToken = (await this.findBy("id", id))[0]

        if (!csrfToken) return undefined

        /** if the token is expired, delete it */
        if (parseInt(csrfToken.expires.toString(), 10) < Date.now()) {
            await this.destroy(csrfToken.id.toString())
            return undefined
        }

        return csrfToken
    }

    public static async destroy(id: string, idCol: string = 'id') {
        const itemFromDb = (await this.findBy("id", id))[0]
        
        if(!itemFromDb) {
            console.error(`[database] error: cannot destroy this item because it doesn't exist in the database.`)
            return
        }

        return this.table.delete({ colName: idCol, value: id })
    }
}
