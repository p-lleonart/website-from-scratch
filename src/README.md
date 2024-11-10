# Docs

This is a part of the documentation about routing, assets, middlewares and http context.

## Routing

### Create a new route

You can add a new item in the `ROUTES` object of `src/app/routes.ts`:

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
export class CoreController extends BaseController {
    async home({ response }: HttpContext) {
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
    controller: ["CoreController", "home"],
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

You can create a file at `src/app/middlewares` and type this code in the the file:

for example:
```ts
import { Middleware } from "#root/middleware"
import { HttpContext } from "#root/types"


export class MyMiddleware extends Middleware {
    public async handle(httpContext: HttpContext) {
        console.log("my middleware")
        return super.handle(httpContext)
    }
}
```

The `super.handle()` intruction will call the next middleware or return the output Http context at the end of middleware execution process (you can edit the ``request`` in the middlewares).

Now you can register it in routes (cf. Route section on this page).

If the '/' route is called, the middleware will be runned before the route code and the middleware can decide if the process continues or no.

There's an example of a middleware that decides to return the response right after it's execution:

```ts
export class TestMiddleware extends Middleware {
    public async handle(httpContext: HttpContext) {
        console.log("authorization middleware")
        const isAuthorized = false  // this is only an example

        if (isAuthorized) {
            return super.handle(httpContext)
        }

        httpContext.response.setErrorResponse({
            statusCode: 403,
            statusMessage: "Unauthorized"
        })
        return httpContext
    }
}
```

Nota: in the case where ``isAuthorized`` is false, we define a response that will be returned directly after the calling of this middleware because we return the Http context and not the next middleware.

Please note that in the "middleware" response context (aka when the middlewares are processed), if you call the response's methods ``redirect``, ``setResponse`` or ``setErrorRespone``, the view after the middleware won't be runned and the response from the last runned middleware will be send to the client.

You can also do the last example using ``MiddlewareError``:

```ts
export class TestMiddleware extends Middleware {
    public async handle(httpContext: HttpContext) {
        console.log("authorization middleware")
        const isAuthorized = false

        if (isAuthorized) {
            return super.handle(httpContext)
        }

        throw new MiddlewareError(403, "Not authorized", "Unauthorized")
    }
}
```

The ``MiddlewareError`` will be catched and it will return the response specified in the exception:
- responseStatus: should be an error HTTP status code
- responseMsg: the body of the error response
- message: the error description
- contentType: default = "text/html"

## Dependency injection

If you want to use Dependency injection for your services, you can by defining your services in `src/app/services`:

```ts
import { Injectable } from "#lib/ioc"

@Injectable()
export class MyService extends BaseService {
    getData() {
        return { data: "my data" }
    }
}
```

The ``Injectable`` decorator permits to define a class that could be injected.

Then in your controller:

```ts
import { Inject } from "#lib/ioc"

export class TestDIController extends BaseController {
    constructor(@Inject(MyService) protected myService: MyService) {
        super()
    }

    myView({ response }: HttpContext) {
        return response.setResponse({
            body: JSON.stringify(this.myService.getData()),
            contentType: "application/json"
        })
    }
}
```

The ``Inject`` decorator defines a dependency of the class.

You can register the views like all controllers.

Nota: you can inject services into services:

```ts
@Injectable()
export class SecondService extends BaseService {
    getData() {
        return "hello, world"
    }
}

@Injectable()
export class FirstService extends BaseService {
    constructor(@Inject(SecondService) protected secondService: SecondService) {
        super()
    }

    getData() {
        return { data: this.secondService.getData() }
    }
}
```

And then in the controller:

```ts
export class TestDIController extends BaseController {
    constructor(@Inject(FirstService) protected firstService: FirstService) {
        super()
    }

    myView({ response }: HttpContext) {
        return response.setResponse({
            body: JSON.stringify(this.firstService.getData()),
            contentType: "application/json"
        })
    }
}
```

Nota: you can inject as many services as you want.

```ts
export class TestDIController extends BaseController {
    constructor(
        @Inject(FirstService) protected firstService: FirstService,
        @Inject(SecondService) protected secondService: SecondService,
    ) {
        super()
    }

    myView({ response }: HttpContext) {
        console.log(this.secondService.getData())

        return response.setResponse({
            body: JSON.stringify(this.firstService.getData()),
            contentType: "application/json"
        })
    }
}
```
