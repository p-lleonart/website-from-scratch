import { randomBytes } from "crypto"
import { BaseModel, DBHandler, Table } from "#database"
import { env } from "#root/env"
import AddCsrfTokenMigration from "#csrf-shield/migrations/add_csrf_tokens"
import { randomId } from "#root/helpers/index"


const CSRF_TOKEN_EXPIRES = parseInt(env.CSRF_TOKEN_EXPIRES, 10)

const dbHandler = new DBHandler(env.DATABASE_NAME ? env.DATABASE_NAME : "database.sqlite")

export default class CsrfToken extends BaseModel {
    public static table: Table = (new AddCsrfTokenMigration(dbHandler)).getTable()

    declare id: string

    declare token: string

    declare expires: number

    public static async create(): Promise<CsrfToken> {
        const id = randomId("rq_")
        const token = randomBytes(32).toString('hex')

        const csrfToken = new CsrfToken()
        csrfToken._setDatas(
            await this.table.add({
                id,
                token,
                expires: Date.now() + CSRF_TOKEN_EXPIRES
            })
        )
        return csrfToken
    }

    public static async find(id: string): Promise<CsrfToken | undefined> {
        const csrfToken = (await this.findBy("id", id))[0] as CsrfToken

        if (!csrfToken) return undefined

        /** if the token is expired, delete it */
        if (parseInt(csrfToken.expires.toString(), 10) < Date.now()) {
            await csrfToken.destroy()
            return undefined
        }

        return csrfToken
    }

    /**
     * Returns the HTML format that must be added in the template to set the CSRF protection
     */
    public formatInput(): string {
        return `<input name="_token" type="hidden" value="${this.token}" />
            <input name="_reqId" type="hidden" value="${this.id}" />`
    }
}
