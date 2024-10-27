import { BaseModel, DBHandler, Table } from "#database"
import { env } from "#root/env"
import { randomId } from "#helpers"
import jwt from "jsonwebtoken"
import { AddAuthTokenMigration } from "#auth/migrations/add_auth_tokens"
import { User } from "./user"


const AUTH_TOKEN_COOKIE_EXPIRES = parseInt(env.AUTH_TOKEN_COOKIE_EXPIRES, 10)

const dbHandler = new DBHandler(env.DATABASE_NAME ? env.DATABASE_NAME : "database.sqlite")

function generateAccessToken(id: string) {
    return jwt.sign({ id: id }, env.SECRET_KEY!, { expiresIn: AUTH_TOKEN_COOKIE_EXPIRES })
}

export class AuthToken extends BaseModel {
    public static table: Table = (new AddAuthTokenMigration(dbHandler)).getTable()

    declare id: string

    declare userId: string

    declare token: string
    
    declare expires: number
    
    public static async create(options: {userId: string}): Promise<AuthToken> {
        if (!await User.find(options.userId)) {
            throw Error("User doesn't exists")
        }

        const pastToken = (await AuthToken.findBy('userId', options.userId))[0] as AuthToken
        if (pastToken && pastToken.expires > 0) {
            await pastToken.destroy()
        }

        const id = randomId('atk')

        const token = new AuthToken()
        token._setDatas(await AuthToken.table.add({
            id,
            userId: options.userId,
            token: generateAccessToken(options.userId),
            expires: Date.now() + AUTH_TOKEN_COOKIE_EXPIRES
        }))

        return token
    }

    public static async getUserIdFromToken(token: string): Promise<string | null> {
        try {
            return new Promise((resolve) => {
                jwt.verify(token, process.env.SECRET_KEY!, (err: any, data: any) => {
                    if (err) throw err
                    resolve(data.id)
                })
            })
        } catch (err) {
            return null
        }
    }
}
