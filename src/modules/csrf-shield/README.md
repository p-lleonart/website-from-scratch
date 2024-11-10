# CSRF Shield

This module provides a CSRF protection system to secure your forms.

## Protect an endpoint

First, you need to create the routes (for this example, we'll create a create post endpoint).

You need a GET endpoint (`PostController.create()`) to display the form and a POST (`PostController.processCreate()`) to handle the request.

Register the `CsrfValidationMiddleware` on your post endpoint:
```ts
    //...
    middlewares: [new CsrfMiddleware()]
    //...
```

In your controller:
```ts
    public async create({ request, response }: HttpContext) {
        const csrfToken = response.generateCsrfToken(request)
        response = response.setCsrfCookie({ request, response }, csrfToken)

        return response.setResponse({
            contentType: "text/html",
            body: render("./src/templates/path/to/template.html", {
                csrfInput: response.csrfHTMLInput(csrfToken)
            })
        })
    }

    public async processCreate({ request, response }: HttpContext) {
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

When the user submits the form, the `CsrfMiddleware` gets the token and verifies it. If the token isn't defined or the token is invalid (doesn't matches with the request id csrf token or it is expired), a 403 page expired exception is raised.

If the token is valid, the process continues.
