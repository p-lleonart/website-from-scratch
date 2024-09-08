import { IncomingMessage } from "http"

import { getPostBody, getUrlParam, setHttpErrorResponse, setResponse } from "../helpers/http"
import { Response } from "../types"
import { render } from "../template-parser"

import { Post } from "../models/post"
import { ModelObject } from "../database/types"


export class PostController {
    static async getAll(req: IncomingMessage, response: Response): Promise<Response> {
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
        
        return setResponse(response, {
            contentType: "application/json",
            body: JSON.stringify(postsSerialized)
        })
    }

    static async get(req: IncomingMessage, response: Response): Promise<Response> {
        const postId = getUrlParam(req, 'id')

        if (!postId) return setHttpErrorResponse(response, {statusCode: 400, statusMessage: "URL param 'id' is missing."})

        const post = await Post.find(postId)
        // OR
        // const post = await Post.findBy('id', postId)

        if (!post) return setHttpErrorResponse(response, {statusCode: 404, statusMessage: "Post not found"})

        return setResponse(response, {
            contentType: "application/json",
            body: JSON.stringify(post)
        })
    }

    static async create(req: IncomingMessage, response: Response): Promise<Response> {
        return setResponse(response, {
            contentType: "text/html",
            body: render("./src/templates/post-create.html", {})
        })
    }

    static async store(req: IncomingMessage, response: Response): Promise<Response> {
        const body = await getPostBody(req)
        const post = { id: `${Date.now()}`, title: body.title, content: body.content }

        Post.create(post)

        return setResponse(response, {
            contentType: "application/json",
            body: JSON.stringify(post),
            statusCode: 201
        })
    }

    static async editView(req: IncomingMessage, response: Response): Promise<Response> {
        const postId = getUrlParam(req, 'id')

        if (!postId) return setHttpErrorResponse(response, {statusCode: 400, statusMessage: "URL param 'id' is missing."})

        const post: any = await Post.find(postId)

        if (!post) return setHttpErrorResponse(response, {statusCode: 404, statusMessage: "Post not found"})

        return setResponse(response, {
            contentType: "text/html",
            body: render("./src/templates/post-update.html", {
                postId: post.id,
                postTitle: post.title,
                postContent: post.content
            })
        })
    }
    
    static async edit(req: IncomingMessage, response: Response): Promise<Response> {
        const postId = getUrlParam(req, 'id')
        const body = await getPostBody(req)

        if (!postId) return setHttpErrorResponse(response, {statusCode: 400, statusMessage: "URL param 'id' is missing."})

        const newPost = await Post.save(postId, body)

        return setResponse(response, {
            contentType: "application/json",
            body: JSON.stringify(newPost)
        })
    }

    static async delete(req: IncomingMessage, response: Response): Promise<Response> {
        const postId = getUrlParam(req, 'id')
        if (!postId) return setHttpErrorResponse(response, {statusCode: 400, statusMessage: "URL param 'id' is missing."})

        await Post.destroy(postId)
        
        return setResponse(response, {
            contentType: "application/json",
            body: JSON.stringify({})
        })
    }
}
