import { CONFIG } from "#app/config"
import { AddAuthTokenMigration } from "#auth/migrations/add_auth_tokens"
import { BaseModel, provider, Table } from "#database"
import { randomId } from "#helpers"
import jwt from "jsonwebtoken"
import { User } from "./user"


const AUTH_TOKEN_COOKIE_EXPIRES = CONFIG.modules.auth.TOKEN_COOKIE_EXPIRES

function generateAccessToken(id: string) {
    return jwt.sign({ id: id }, CONFIG.SECRET_KEY, { expiresIn: AUTH_TOKEN_COOKIE_EXPIRES })
}

export class AuthToken extends BaseModel {
    public static table: Table = (new AddAuthTokenMigration()).getTable()

    declare id: string

    declare userId: string

    declare token: string
    
    declare expires: number
    
    public static async create(options: {userId: string}): Promise<AuthToken> {
        if (!await User.find(options.userId)) {
            throw Error("User doesn't exists")
        }

        const pastTokens = (await AuthToken.findBy('userId', options.userId)) as AuthToken[]
        for (const pastToken of pastTokens) {
            await pastToken.destroy()
        }

        const id = randomId('atk')

        const token = new AuthToken()
        token._setDatas(
            await provider.insert(AuthToken.table, {
                id,
                userId: options.userId,
                token: generateAccessToken(options.userId),
                expires: Date.now() + AUTH_TOKEN_COOKIE_EXPIRES
            })
        )

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
