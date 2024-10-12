import { config } from "dotenv"

const conf = config()

if (conf.error) {
    throw conf.error
}

if (!conf.parsed) {
    throw Error("[environment]: .env file not found.")
}

// constant default values setting

if (!conf.parsed["AUTH_TOKEN_COOKIE_NAME"]) {
    conf.parsed["AUTH_TOKEN_COOKIE_NAME"] = "auth_token"
}

if (!conf.parsed["AUTH_TOKEN_COOKIE_EXPIRES"]) {
    conf.parsed["AUTH_TOKEN_COOKIE_EXPIRES"] = "1800000"
}

if (!conf.parsed["CSRF_TOKEN_EXPIRES"]) {
    conf.parsed["CSRF_TOKEN_EXPIRES"] = "300000"
}

export const env = conf.parsed
