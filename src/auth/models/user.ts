import { AuthToken } from "./auth_token"

import { compareSync, genSaltSync, hashSync } from "bcrypt"

import { env } from "../../env"
import { BaseModel } from "../../database/base-model"
import { DBHandler } from "../../database/db-handler"
import { Table } from "../../database/table"
import { ModelObject } from "../../database/types"

import { setCookie, getCookie, deleteCookie, randomId } from "../../helpers"
import { IncomingMessage } from "http"

import { AddUserMigration } from "../migrations/add_users"

import { Response } from "../../types"


const AUTH_TOKEN_COOKIE_EXPIRES = env.AUTH_TOKEN_COOKIE_EXPIRES
    ? parseInt(env.AUTH_TOKEN_COOKIE_EXPIRES, 10)
    : 1800000

const AUTH_TOKEN_COOKIE_NAME = env.AUTH_TOKEN_COOKIE_NAME
    ? env.AUTH_TOKEN_COOKIE_NAME
    : "auth_token"

const dbHandler = new DBHandler(env.DATABASE_NAME ? env.DATABASE_NAME : "database.sqlite")

const saltRounds = env.SALT_ROUNDS ? parseInt(env.SALT_ROUNDS) : 10

export class User extends BaseModel {
    public static table: Table = (new AddUserMigration(dbHandler)).getTable()

    public static async create(options: {name: string, email: string, password: string}) {
        const usersFromDb = await User.findBy('email', options.email)
        if(!usersFromDb || usersFromDb.length > 0) {
            throw Error("Email already taken")
        }

        const salt = genSaltSync(saltRounds)
        const hash = hashSync(options.password, salt)
        const id = randomId('usr')

        return this.table.add({ id, name: options.name, email: options.email, password: hash})
    }

    public static async verifyCrendentials(email: string, password: string) {
        const user = await User.findBy("email", email)
        if (!user || !user[0]) throw Error("User doesn't exist")
        
        const match = compareSync(password, user[0].password as string)

        if (match) return user[0]

        return null
    }

    /**
     * Stores the user's auth token in a cookie.
     * 
     * E.g : `response = await User.login(response, user)`
     * 
     * @param response Needed to set the cookie that will contain the auth token
     * @param user 
     * @returns response
     */
    public static async login(response: Response, user: ModelObject) {
        const authTokensFromDb = await AuthToken.findBy('userId', user.id as string)
        let authToken: ModelObject

        if (!authTokensFromDb || !authTokensFromDb[0]) {
            authToken = await AuthToken.create({ userId: user.id as string })
        } else {
            authToken = authTokensFromDb[0]
        }

        response.headers = setCookie(response.headers, {
            name: AUTH_TOKEN_COOKIE_NAME,
            value: encodeURIComponent(authToken.token as string),
            httpOnly: true,
            secure: true,
            expires: new Date(Date.now() + AUTH_TOKEN_COOKIE_EXPIRES).toUTCString()
        })
        return response
    }

    public static async logout(response: Response, user: ModelObject) {
        const authTokensFromDb = await AuthToken.findBy('userId', user.id as string)
        let authToken: ModelObject

        if (!authTokensFromDb || !authTokensFromDb[0]) return response
        
        authToken = authTokensFromDb[0]
        await AuthToken.destroy(authToken.id)
        response.headers = deleteCookie(response.headers, AUTH_TOKEN_COOKIE_NAME)

        return response
    }

    public static async getCurrentUser(req: IncomingMessage) {
        const token = getCookie(req, AUTH_TOKEN_COOKIE_NAME)
        if (!token) return null

        const userId = await AuthToken.getUserIdFromToken(decodeURIComponent(token))
        if (!userId) return null

        return await User.find(userId as string)
    }
}
