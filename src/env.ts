import { config } from "dotenv"

const conf = config()

if (conf.error) {
    throw conf.error
}

if (!conf.parsed) {
    throw Error("[environment]: .env file not found.")
}

if (!conf.parsed["NODE_ENV"] || !["dev", "test", "production"].includes(conf.parsed["NODE_ENV"])) {
    console.log("[env] info: unrecognised running env, setting it to 'dev'")
    conf.parsed["NODE_ENV"] = "dev"
}

export const env = conf.parsed
