import { config } from "dotenv"

const conf = config()

if (conf.error) {
    throw conf.error
}

if (!conf.parsed) {
    throw Error("[environment]: .env file not found.")
}

/** constant default values setting */

if (!conf.parsed["AUTH_TOKEN_COOKIE_NAME"]) {
    conf.parsed["AUTH_TOKEN_COOKIE_NAME"] = "auth_token"
}

if (!conf.parsed["AUTH_TOKEN_COOKIE_EXPIRES"]) {
    conf.parsed["AUTH_TOKEN_COOKIE_EXPIRES"] = "1800000"
}

if (!conf.parsed["SESSION_ID_COOKIE_NAME"]) {
    conf.parsed["SESSION_ID_COOKIE_NAME"] = "session_id"
}

if (!conf.parsed["SESSION_ID_COOKIE_EXPIRES"]) {
    conf.parsed["SESSION_ID_COOKIE_EXPIRES"] = "1800000"
}

if (!conf.parsed["SESSION_ID_LENGTH"]) {
    conf.parsed["SESSION_ID_LENGTH"] = "16"
}

if (!conf.parsed["CSRF_TOKEN_COOKIE_NAME"]) {
    conf.parsed["CSRF_TOKEN_COOKIE_NAME"] = "csrf_token"
}

if (!conf.parsed["CSRF_TOKEN_HEADER_NAME"]) {
    conf.parsed["CSRF_TOKEN_HEADER_NAME"] = "x-csrf-token"
}

if (!conf.parsed["CSRF_TOKEN_BODY_FIELD_NAME"]) {
    conf.parsed["CSRF_TOKEN_BODY_FIELD_NAME"] = "_token"
}

if (!conf.parsed["CSRF_TOKEN_EXPIRES"]) {
    conf.parsed["CSRF_TOKEN_EXPIRES"] = "300000"
}

if (!conf.parsed["NODE_ENV"]) {
    conf.parsed["NODE_ENV"] = "dev"
}

export const env = conf.parsed
