# Docs

This is a part of the documentation about routing, assets, middlewares and http context.

## Routing

### Create a new route

You can add a new item in the `ROUTES` object of `src/routes.ts`:

```ts
export const ROUTES = {
    "GET:/": {
        callback: async ({ response }: HttpContext) => {
            return response.setResponse({
                contentType: "text/html",
                body: await readFile("./src/templates/index.html", "utf8")
            })
        },
    },
}
```

As you can see, the key is the endpoint of the route (if a GET request on '/' is detected, the specified callback will be called).

The callback takes a `HttpContext` parameter, and must return a `Response`. These are needed to achieve the request path into our system, from the receiving to the response sending.

If we can, we can add middlewares and route description:

```ts
export const ROUTES = {
    "GET:/": {
        callback: async ({ response }: HttpContext) => {
            return response.setResponse({
                contentType: "text/html",
                body: await readFile("./src/templates/index.html", "utf8")
            })
        },
        middlewares: [ new MyMiddleware() ],
        description: 'This is the homepage',
    },
}
```

### Routes with params

You can specify a parameter by writing `:<param name>` in the url, like in the examples below:

```ts
    "GET:/hello/:name": {
        callback: async ({ request, response }: HttpContext) => {
            return response.setResponse({
                contentType: "text/html",
                body: `Hello ${request.params.name}`
            })
        }
    },
    "GET:/hello/:name/:hi": {
        callback: async ({ request, response }: HttpContext) => {
            return response.setResponse({
                contentType: "text/html",
                body: `Hello ${request.params.name} ${request.params.hi}`
            })
        }
    },
```

If you want to access to those params in the controller, you can get them from `request.params.<param>`.

Nota: you cannot have two params between two `/`. E.g: this `/post/:slug-:id` won't work. Instead do `post/:slug/:id`.

### Controllers

You can create controllers to split the code in many files.

```ts
export class CoreController {
    static async home({ response }: HttpContext) {
        return response.setResponse({
            contentType: "text/html",
            body: await readFile("./src/templates/index.html", "utf8")
        })
    }
}
```

And then your route is like this:

```ts
"GET:/": {
    callback: async (httpContext: HttpContext) => CoreController(httpContext),
    middlewares: [ new MyMiddleware() ],
    description: 'This is the homepage',
},
```

## Http context

The http context is an object containing the response and the request during the request travel into our server. It's created when the server get receive the request, and the response is what's you'll return to the client.

It contains a optional `req` instance that is the request from Node HTTP module.

### Request

You can create a new instance (if you want) by calling the `Request.init()` static method, but the server creates it automatically.

This class has a lot of getters that permits you to access to the request data. See the implementation for more infos.

### Response

The response is what you'll send to the client, so you need to know how it works.

The server creates it automatically like Request, and your "job" is to find what you have to put in it.

There's a lot of getters and setters on this class, see the implementation for more infos.

## Assets

### `public` directory

All files contained in the public directory will be registered as GET endpoints by the server thanks to the Assets Helper on the server startup.

The endpoint url will be the relative path of the file from `public`.

If the file extension isn't in the `/src/content-types.json` file, please add it yourself (it will be served as plain text otherwise).


## Middlewares

Middlewares are functions that are executed before the route function and permits to do some checks about the request.

If you want to know if a user is logged in or not, you'll need to implement a middleware (I mean, you can do this in a controller but it's not clean because you might use the same code in other routes etc...).

You can create a file at `src/middlewares` and type this code in the the file:

for example:
```ts
import { Middleware } from "@/middleware"
import { HttpContext } from "@/types"


export class MyMiddleware extends Middleware {
    public async handle(httpContext: HttpContext) {
        console.log("my middleware")
        return {httpContext, returnResponse: false}
    }
}
```

Now you can register it in routes (cf. Route section on this page).

If the '/' route is called, the middleware will be runned before the route code and the middleware can decide if the process continues or no.

There's an example of a middleware that decides to return the response right after it's execution:

```ts
export class TestMiddleware extends Middleware {
    public async handle(httpContext: HttpContext) {
        console.log("authorization middleware")
        httpContext.response.setErrorResponse({
            statusCode: 403,
            statusMessage: "Unauthorized"
        })
        return {httpContext, returnResponse: true}
    }
}
```

Nota: the current middleware implementation might be updated in the future, for something that looks like:

```ts
export class TestMiddleware extends Middleware {
    public async handle(httpContext: HttpContext, next: Function) {
        console.log("authorization middleware")
        if (1 + 1 != 3) {
            httpContext.response.setErrorResponse({
                statusCode: 403,
                statusMessage: "Unauthorized"
            })
            return httpContext
        }
        
        return next(httpContext)
    }
}
```

Where next is a function that will call the next middleware.
