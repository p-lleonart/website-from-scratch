import { BaseSeeder } from "@database"
import { Post } from "@/models/post"


export class PostSeeder extends BaseSeeder {
    public async run() {
        await Post.create({
            id: Date.now(),
            title: "created by seeder",
            content: "this is a post created by the seeder"
        })
    }
}
