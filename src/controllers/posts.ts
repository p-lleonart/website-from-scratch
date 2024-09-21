import { getPostBody, getUrlParam } from "../helpers/http"
import { Post } from "../models/post"
import { ModelObject } from "../modules/database/types"
import { render } from "../modules/template-parser"
import { HttpContext } from "../types"


export class PostController {
    static async getAll({ response }: HttpContext) {
        const posts = await Post.findAll()
        const postsSerialized: ModelObject[] = await new Promise((resolve, reject) => {
            let serialized: ModelObject[] = []

            posts.forEach(async post => {
                const postSerialized = await Post.serialize(post, {
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

    static async get({ req, response }: HttpContext) {
        const postId = getUrlParam(req, 'id')

        if (!postId) return response.setErrorResponse({statusCode: 400, statusMessage: "URL param 'id' is missing."})

        const post = await Post.find(postId)
        // OR
        // const post = await Post.findBy('id', postId)

        if (!post) return response.setErrorResponse({statusCode: 404, statusMessage: "Post not found"})

        return response.setResponse({
            contentType: "application/json",
            body: JSON.stringify(post)
        })
    }

    static async create({ response }: HttpContext) {
        return response.setResponse({
            contentType: "text/html",
            body: render("./src/templates/post-create.html", {})
        })
    }

    static async store({ req, response }: HttpContext) {
        const body = await getPostBody(req)
        const post = { id: `${Date.now()}`, title: body.title, content: body.content }

        Post.create(post)

        return response.setResponse({
            contentType: "application/json",
            body: JSON.stringify(post),
            statusCode: 201
        })
    }

    static async editView({ req, response }: HttpContext) {
        const postId = getUrlParam(req, 'id')

        if (!postId) return response.setErrorResponse({statusCode: 400, statusMessage: "URL param 'id' is missing."})

        const post: any = await Post.find(postId)

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
    
    static async edit({ req, response }: HttpContext) {
        const postId = getUrlParam(req, 'id')
        const body = await getPostBody(req)

        if (!postId) return response.setErrorResponse({statusCode: 400, statusMessage: "URL param 'id' is missing."})

        const newPost = await Post.save(postId, body)

        return response.setResponse({
            contentType: "application/json",
            body: JSON.stringify(newPost)
        })
    }

    static async delete({ req, response }: HttpContext) {
        const postId = getUrlParam(req, 'id')
        if (!postId) return response.setErrorResponse({statusCode: 400, statusMessage: "URL param 'id' is missing."})

        await Post.destroy(postId)
        
        return response.setResponse({
            contentType: "application/json",
            body: JSON.stringify({})
        })
    }
}
