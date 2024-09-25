import { Post } from "../models/post"
import { BaseSeeder } from "../modules/database"


export class PostSeeder extends BaseSeeder {
    public async run() {
        await Post.create({
            id: Date.now(),
            title: "created by seeder",
            content: "this is a post created by the seeder"
        })
    }
}
