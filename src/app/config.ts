import { errors as formidableErrors } from "formidable"

import { env } from "#root/env"
import type { Config } from "#root/types"
import { SessionMiddleware } from "#sessions"


export const CONFIG: Config = {
    port: 3000,

    // https: {
    //     key: 'tmp/private-key.pem',
    //     cert: 'tmp/certificate.pem',
    // },

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

    /**
     * For more information, please refer to Formidable's documentation (``formidable.Options``).
     */
    form: {
        formOptions: {
            encoding: "utf-8",
            keepExtensions: true,
            uploadDir: "tmp/uploads",
        },


        /**
         * Nota about `form.errorHandler`:
         * 
         * This function is called if a parsing error occured while the request's body parsing.
         * 
         * You can use it to do some checks before returning the HTTP 400 error response (to customize the error message, for example).
         */

        // errorHandler: (err: any) => {
        //     if (err.code && err.code === 1009) {  // formidableErrors.biggerThanTotalMaxFileSize === 1009
        //         return "Your file is too big"
        //     }

        //     return err.message
        // }
    },

    modules: {
        auth: {
            TOKEN_COOKIE_NAME: env.AUTH_TOKEN_COOKIE_NAME ?? "auth_token",
            TOKEN_COOKIE_EXPIRES: env.AUTH_TOKEN_COOKIE_EXPIRES
                ? parseInt(env.AUTH_TOKEN_COOKIE_EXPIRES, 10)
                : 1800000,
            SALT_ROUNDS: env.AUTH_SALT_ROUNDS
                ? parseInt(env.AUTH_SALT_ROUNDS, 10)
                : 10
        },
    
        csrfShield: {
            TOKEN_COOKIE_NAME: env.CSRF_TOKEN_COOKIE_NAME ?? "csrf_token",
            TOKEN_BODY_NAME: env.CSRF_TOKEN_BODY_FIELD_NAME ?? "_token",
            TOKEN_HEADER_NAME: env.CSRF_TOKEN_HEADER_NAME ?? "x-csrf-token",
            TOKEN_EXPIRES: env.CSRF_TOKEN_EXPIRES
                ? parseInt(env.CSRF_TOKEN_EXPIRES, 10)
                : 300000,
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
                port: env.DATABASE_PORT?
                    parseInt(env.DATABASE_PORT, 10)
                    : 5432,
            }
        },
        
        sessions: {
            ID_COOKIE_NAME: env.SESSION_ID_COOKIE_NAME ?? "session_id",
            ID_COOKIE_EXPIRES: env.SESSION_ID_COOKIE_EXPIRES
                ? parseInt(env.SESSION_ID_COOKIE_EXPIRES, 10)
                : 1800000,
            ID_LENGTH: env.SESSION_ID_LENGTH
                ? parseInt(env.SESSION_ID_LENGTH, 10)
                : 16,
        },
        
        templaterParser: {},

        validatorConfig: {},
    },
}
