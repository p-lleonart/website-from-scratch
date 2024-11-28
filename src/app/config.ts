import { env } from "#root/env"
import type { Config } from "#root/types"
import { SessionMiddleware } from "#sessions"


export const CONFIG: Config = {
    /**
     * Configure middlewares that will be executed on each routes.
     * 
     * Nota: do not create instances of middlewares in this list.
     */
    globalMiddlewares: [
        SessionMiddleware,
    ],

    NODE_ENV: env.NODE_ENV as 'dev' | 'test' | 'production',

    SECRET_KEY: env.SECRET_KEY,

    modules: {
        auth: {
            TOKEN_COOKIE_NAME: env.AUTH_TOKEN_COOKIE_NAME ?? "auth_token",
            TOKEN_COOKIE_EXPIRES: parseInt(env.AUTH_TOKEN_COOKIE_EXPIRES, 10) ?? 1800000,
            SALT_ROUNDS: parseInt(env.AUTH_SALT_ROUNDS, 10) ?? 10
        },
    
        csrfShield: {
            TOKEN_COOKIE_NAME: env.CSRF_TOKEN_COOKIE_NAME ?? "csrf_token",
            TOKEN_BODY_NAME: env.CSRF_TOKEN_BODY_FIELD_NAME ?? "_token",
            TOKEN_HEADER_NAME: env.CSRF_TOKEN_HEADER_NAME ?? "x-csrf-token",
            TOKEN_EXPIRES: parseInt(env.CSRF_TOKEN_EXPIRES, 10) ?? 300000,
        },
        
        database: {
            NAME: env.DATABASE_NAME ?? "database.sqlite",
            PATH: env.DATABASE_PATH ?? "database.sqlite",
            PROVIDER: env.DATABASE_PROVIDER ?? "sqlite",
            CONFIG: {
                user: env.DATABASE_USER ?? 'localhost',
                host: env.DATABASE_HOST ?? 'localhost',
                database: env.DATABASE_NAME ?? "database.db",
                password: env.DATABASE_PASSWORD ?? "",
                port: env.DATABASE_PORT ?? 5432,
            }
        },
        
        sessions: {
            ID_COOKIE_NAME: env.SESSION_ID_COOKIE_NAME ?? "session_id",
            ID_COOKIE_EXPIRES: parseInt(env.SESSION_ID_COOKIE_EXPIRES, 10) ?? 1800000,
            ID_LENGTH: parseInt(env.SESSION_ID_LENGTH, 10) ?? 16,
        },
        
        templaterParser: {},

        validatorConfig: {},
    },
}
