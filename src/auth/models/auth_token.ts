import { env } from "../../env"
import { BaseModel } from "../../database/base-model"
import { DBHandler } from "../../database/db-handler"
import { Table } from "../../database/table"

import { randomId } from "../../helpers"

import { sign, verify } from "jsonwebtoken"

import { AddAuthTokenMigration } from "../migrations/add_auth_tokens"

import { User } from "./user"


const AUTH_TOKEN_COOKIE_EXPIRES = env.AUTH_TOKEN_COOKIE_EXPIRES
    ? parseInt(env.AUTH_TOKEN_COOKIE_EXPIRES, 10)
    : 1800000

const dbHandler = new DBHandler(env.DATABASE_NAME ? env.DATABASE_NAME : "database.sqlite")

function generateAccessToken(id: string) {
    return sign({ id: id }, env.SECRET_KEY!, { expiresIn: AUTH_TOKEN_COOKIE_EXPIRES })
}

export class AuthToken extends BaseModel {
    public static table: Table = (new AddAuthTokenMigration(dbHandler)).getTable()
    
    public static async create(options: {userId: string}) {
        if (!await User.find(options.userId)) {
            throw Error("User doesn't exists")
        }

        const pastToken = await this.findBy('userId', options.userId)
        if (pastToken && pastToken.length > 0) {
            await this.destroy(pastToken[0].id)
        }

        const id = randomId('atk')

        return this.table.add({
            id,
            userId: options.userId,
            token: generateAccessToken(options.userId),
            expires: Date.now() + AUTH_TOKEN_COOKIE_EXPIRES
        })
    }

    public static async getUserIdFromToken(token: string) {
        try {
            return new Promise((resolve) => {
                verify(token, process.env.SECRET_KEY!, (err: any, data: any) => {
                    if (err) throw err
                    resolve(data.id)
                })
            })
        } catch (err) {
            return null
        }
    }
}
