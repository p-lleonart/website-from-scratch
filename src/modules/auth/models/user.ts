import { hash, verify } from "argon2"

import { CONFIG } from "#app/config"
import { AddUserMigration } from "#auth/migrations/add_users"
import { AuthToken } from "./auth_token"
import { BaseModel, provider, Table } from "#database"
import { randomId } from "#helpers"
import { Request, Response } from "#lib/http"
import { HttpContext } from "#root/types"


const AUTH_TOKEN_COOKIE_NAME = CONFIG.modules.auth.TOKEN_COOKIE_NAME
const AUTH_TOKEN_COOKIE_EXPIRES = CONFIG.modules.auth.TOKEN_COOKIE_EXPIRES
const saltRounds = CONFIG.modules.auth.SALT_ROUNDS

export class User extends BaseModel {
    public static table: Table = (new AddUserMigration()).getTable()

    declare id: string

    declare name: string

    declare email: string

    declare password: string

    public static async create(options: {name: string, email: string, password: string}): Promise<User> {
        const usersFromDb = await User.findBy('email', options.email)
        if(!usersFromDb || usersFromDb.length > 0) {
            throw Error("Email already taken")
        }

        const hashedPsw = await hash(options.password, { salt: saltRounds })
        const id = randomId('usr')

        const user = new User()
        user._setDatas(
            await provider.insert(
                User.table, 
                { id, name: options.name, email: options.email, password: hashedPsw}
            )
        )
        return user
    }

    public static async verifyCrendentials(email: string, password: string): Promise<User | null> {
        const user = (await User.findBy("email", email))[0] as User
        if (!user) throw Error("User doesn't exist")
        
        const match = await verify(user.password as string, password)

        if (match) return user

        return null
    }

    /**
     * Stores the user's auth token in a cookie.
     * 
     * E.g : `response = await User.login(response, user)`
     * 
     * @param httpContext Needed to set the cookie that will contain the auth token
     * @param user 
     * @returns response
     */
    public static async login({ request, response }: HttpContext, user: User): Promise<Response> {
        let authToken = (await AuthToken.findBy('userId', user.id as string))[0] as AuthToken

        if (!authToken) {
            authToken = await AuthToken.create({ userId: user.id as string }) as AuthToken
        }

        return request.cookieHandler.setCookie(response, {
            name: AUTH_TOKEN_COOKIE_NAME,
            value: encodeURIComponent(authToken.token as string),
            httpOnly: true,
            secure: true,
            expires: new Date(Date.now() + AUTH_TOKEN_COOKIE_EXPIRES).toUTCString()
        })
    }

    public static async logout({ request, response }: HttpContext, user: User): Promise<Response> {
        let authToken = (await AuthToken.findBy('userId', user.id as string))[0]

        if (!authToken) return response
        
        await authToken.destroy()
        return request.cookieHandler.deleteCookie(response, AUTH_TOKEN_COOKIE_NAME)
    }

    public static async getCurrentUser(request: Request): Promise<User | undefined> {
        const token = request.cookieHandler.getCookie(AUTH_TOKEN_COOKIE_NAME)
        if (!token) return undefined

        const userId = await AuthToken.getUserIdFromToken(decodeURIComponent(token))
        if (!userId) return undefined

        return await User.find(userId as string) as User
    }
}
