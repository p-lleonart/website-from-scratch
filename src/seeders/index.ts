import 'module-alias/register'

import { BaseSeeder } from "@database"

import { PostSeeder } from "./post"


const seeders: { [key: string]: BaseSeeder } = {
    "create_initial_post": new PostSeeder()
}

Object.keys(seeders).forEach(key => BaseSeeder.runSeeder(key, seeders[key]))
