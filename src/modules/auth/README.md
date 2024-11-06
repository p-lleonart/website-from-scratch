# auth

The auth module can handle user authentication with JWT and HTTP cookies.

It uses bcrypt to hash passwords and jsonwebtoken to generate the authentication tokens.

## Models & migrations
Go in `src/modules/auth`.

Now edit the migrations and models in `migrations` if you need (default user model contains a name, email, id and a password, the default auth token model contains a userId, a token, an expiration date and an id).

Now you can register these migrations in `/src/app/migrations/index.ts` (cf. Database module).

Then run the migrations: `pnpm run migrate add_auth_token=up add_users=up`.

You can now create a controller.

## User registration

Here's a demonstration of a view that creates a user:
```ts
    const body = request.body
    let user: User | null

    // body validation

    try {
        user = await User.create({ name: body.name, email: body.email, password: body.password})
    } catch (err: any) {
        // handle error
    }

    response = await User.login({ request, response }, user)
    return response.redirect("/users/dashboard")
```

Please note that the creation part is quite standart, let's focus on the `User.login({ request, response }, user)`.

This method sets a cookie containing the authentication token after a user login. This cookie will serve to the auth middleware to see if the user is allowed to access to a page (it will get the token out of it and then try to get the user). Furthermore, the token will be stored in the database.

## User login

There's a part of a login view:
```ts
    const body = request.body
    let user: User | null
    
    // body validation

    try {
        user = await User.verifyCrendentials(body.email, body.password)
    } catch (err: any) {
        // some errors could happen here
    }

    if (user) {
        response = await User.login({ request, response }, user)
        return response.redirect("/users/dashboard")
    }

    // wrong credentials
```

As you can see, we're using `User.login()` here as well.

Now, let's have a look about `User.verifyCredentials()`. This method will verify if the password provided by the user matches with the password of the user identified by it's email. The method will return the user if they match, `null` else.


## User logout

Some code from a logout view:
```ts
    const user = await User.getCurrentUser(request)
    response = await User.logout({ request, response }, user!)  // user exists in all cases thanks to the middleware
    return response.redirect("/users/login")
```

First of all, we get the current user logged in with the `User.getCurrentUser()` method (we'll use this method to get the current user if we need them).

Then, we call `User.logout()`, that will suppress the auth token cookie and the token in the database too.

## Middleware & protect routes

### Auth middleware

Now let's have a look on the Auth middleware (you can learn how does a middleware in the same time):

```ts
export class AuthMiddleware extends Middleware {
    public async handle({ req, request, response }: HttpContext, response: Response) {
        const user = await User.getCurrentUser(request)

        if (!user) {
            response = request.cookieHandler.deleteCookie(response, env.AUTH_TOKEN_COOKIE_NAME)
            response.statusCode = 403
            return {
                httpContext: {
                    req,
                    request,
                    response: response.redirect("/users/login?loginRequired"),
                },
                returnResponse: true
            }
        }

        return { httpContext: { req, request, response }, returnResponse: false}
    }
}
```

So, first, it will try to get the current user. Then, if they doesn't exist, it will destroy the auth token cookie and return a redirection to the login page. If the user exists, the system will call the next middleware or the controller.

Note: the `returnResponse` is here to tell to the router that they have to return the response directly after this middleware, if it's `false`, then the router will call the next middleware or the view.

### Register middlewares

You can register a middleware on a route directly:

```ts
export const ROUTES: {[key: string]: Route} = {
    // ...
    "GET:/users/dashboard": {
        callback: async (httpContext: HttpContext) => UserController.dashboard(httpContext),
        middlewares: [
            new AuthMiddleware()
        ]
    }
    // ...
}
```

You just have to add a middleware list containing all middleware.

Note: the middleware will be processed in the same order as they were set:

```ts
export const ROUTES: {[key: string]: Route} = {
    // ...
    "GET:/users/dashboard": {
            callback: async (httpContext: HttpContext) => UserController.dashboard(httpContext),
            middlewares: [
                new AuthMiddleware(),
                new SomeMiddleware(),
            ]
        }
    }
    // ...
}
```

In this case, the `AuthMiddleware` will be called before the `SomeMiddleware`.
