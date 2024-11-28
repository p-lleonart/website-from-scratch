import { Post } from "#app/models/post"
import { ModelObject } from "#database/types"
import { render } from "#template-parser"
import { BaseController } from "#lib/ioc"
import { HttpContext } from "#root/types"


export class PostController extends BaseController {
    public async getAll({ response }: HttpContext) {
        const posts = await Post.findAll() as Post[]
        const postsSerialized: ModelObject[] = await new Promise((resolve, reject) => {
            let serialized: ModelObject[] = []

            posts.forEach(async post => {
                const postSerialized = post.serialize({
                    id: {
                        serializeAs: "postId"
                    },
                    title: {
                        doSerialize: (value: string | number) => `${value.toString().slice(0, 10)}...`
                    }
                })
                serialized.push(postSerialized!)
            })
            
            resolve(serialized)
        })
        
        return response.setResponse({
            contentType: "application/json",
            body: JSON.stringify(postsSerialized)
        })
    }

    public async get({ request, response }: HttpContext) {
        const postId = request.query.get('id')

        if (!postId) return response.setErrorResponse({statusCode: 400, statusMessage: "URL param 'id' is missing."})

        const post = await Post.find(postId) as Post
        // OR
        // const post = await Post.findBy('id', postId) as Post

        if (!post) return response.setErrorResponse({statusCode: 404, statusMessage: "Post not found"})

        return response.setResponse({
            contentType: "application/json",
            body: post.toJson()
        })
    }

    public async create({ response }: HttpContext) {
        return response.setResponse({
            contentType: "text/html",
            body: render("./src/templates/post-create.html", {})
        })
    }

    public async store({ request, response }: HttpContext) {
        const body = request.body
        const postData = { id: `${Date.now()}`, title: body.title, content: body.content }

        const post = await Post.create(postData) as Post

        return response.setResponse({
            contentType: "application/json",
            body: post.toJson(),
            statusCode: 201
        })
    }

    public async editView({ request, response }: HttpContext) {
        const postId = request.query.get('id')

        if (!postId) return response.setErrorResponse({statusCode: 400, statusMessage: "URL param 'id' is missing."})

        const post: any = await Post.find(postId) as Post

        if (!post) return response.setErrorResponse({statusCode: 404, statusMessage: "Post not found"})

        return response.setResponse({
            contentType: "text/html",
            body: render("./src/templates/post-update.html", {
                postId: post.id,
                postTitle: post.title,
                postContent: post.content
            })
        })
    }
    
    public async edit({ request, response }: HttpContext) {
        const postId = request.query.get('id')
        const body = request.body

        if (!postId) return response.setErrorResponse({statusCode: 400, statusMessage: "URL param 'id' is missing."})

        const post = await Post.find(postId) as Post
        post.title = body.title ? body.title : post.title
        post.content = body.content ? body.content : post.content
        await post.save()

        return response.setResponse({
            contentType: "application/json",
            body: post.toJson()
        })
    }

    public async delete({ request, response }: HttpContext) {
        const postId = request.query.get('id')
        if (!postId) return response.setErrorResponse({statusCode: 400, statusMessage: "URL param 'id' is missing."})

        const post = await Post.find(postId) as Post
        await post.destroy()
        
        return response.setResponse({
            contentType: "application/json",
            body: JSON.stringify({})
        })
    }
}
