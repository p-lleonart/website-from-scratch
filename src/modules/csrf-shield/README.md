# CSRF Shield

This module provides a CSRF protection system to secure your forms.

## Models & migrations
Go in `src/modules/csrf-shield`.

Now edit the migrations and models in `migrations` if you need.

Now you can register these migrations in `/src/app/migrations/index.ts` (cf. Database module).

Then run the migrations: `pnpm run migrate add_csrf_token=up`.

## Protect an endpoint

First, you need to create the routes (for this example, we'll create a create post endpoint).

You need a GET endpoint (`PostController.create()`) to display the form and a POST (`PostController.processCreate()`) to handle the request.

Register the `CsrfValidationMiddleware` on your post endpoint:
```ts
    //...
    middlewares: [new CsrfValidationMiddleware()]
    //...
```

In your controller:
```ts
    public static async create({ response }: HttpContext) {
        const csrfToken = await response.generateCsrfToken()

        return response.setResponse({
            contentType: "text/html",
            body: render("./src/templates/path/to/template.html", {
                csrfInput: csrfToken.formatInput()
            })
        })
    }

    public static async processCreate({ request, response }: HttpContext) {
        // ...
    }
```

In the template:
```html
    <!-- ... -->

    <form action="#" method="post">
        {{csrfInput}}

        <!-- ... -->
    </form>

    <!-- ... -->
```

What's happening in this example?

First, the user will load the form, and the server will add a little hidden input contening the token in the form.

When the user submits the form, the `CsrfValidationMiddleware` gets the token and verifies it. If the token isn't defined or the token is invalid (doesn't matches with the request id csrf token or it is expired), a 403 page expired exception is raised.

If the token is valid, the process continues.
