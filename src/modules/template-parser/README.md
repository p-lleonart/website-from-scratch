# template-parser

This is a little guide to help you to use the template system.

The syntax is pretty similar to Svelte one's.

## Demonstration

In `./src/app/controllers/template-demo.ts`:
```ts
export class TemplateDemoController {
    static async view({ request, response}: HttpContext): Promise<Response> {
        const messagesSent = 3
        return response.setResponse({
            contentType: "text/html",
            body: render("./src/templates/demo.html", {
                name: "john doe",
                text: "hello, world!",
                messagesSent: messagesSent,
                msgs: ["hi", "hi1", "hi2"],
                isSentALotOfMsg: messagesSent > 3  // Nota: conditions aren't supported inside of the template, so put the condition into a variable and do a condition as '{{if condition}} ...'
            })
        })
    }
}
```

In `./src/templates/demo.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Template Demo</title>

    <!-- ... -->
</head>
<body>
    <h3>Hi, {{name}}!</h3>
    <p>{{text}}</p>

    {{#if msgs}}
        {{#for msg in msgs}}
            <p>{{msg}}</p>
        {{/for}}
    {{/if}}

    <!-- Nota: if the parser couldn't load the component, it will display the block of code between its tags -->
    {{#include src/templates/component.html}}
        <p>Couldn't load component.html</p>
    {{/include}}

    <script src="/app.js"></script>
</body>
</html>
```

And `./src/templates/conponent.html`:
```html
<pre>./src/templates/component.html</pre>

<!-- as you can see, the included templates inherits of the main context -->
<!-- as I said above, make a condition like this with the condition variable -->
{{#if isSentALotOfMsg}}
    <p>You sent us a lot of messages ({{messagesSent}}), thanks</p>
{{/if}}
```

Warning: make sure to register the route!

With this example, we get this response:
```html
    <!-- ... -->

    <h3>Hi, john doe!</h3>
    <p>hello, world!</p>

    

    
        
            <p>hi</p>
        
            <p>hi1</p>
        
            <p>hi2</p>
        
    

    <pre>./src/templates/component.html</pre>
    

<p>You sent us a lot of messages (4), thanks</p>
<pre>from component</pre>

    <!-- ... -->
```

## Reference

### `render(path: string, context: Context): string`:
- `path`: the path of the template to parse.
- `context`: the context, in other words the variables that will serve to edit the template.

### `Context`: it is an object of string keys (the variables names) and their values. The values can be string, number, boolean and arrays of string, numbers or booleans.

### `TemplateNotFound(path: string)`: shows an error message (in console) if a template isn't found. If it's the main template, it returns this HTML in the response: ```"<pre>[template-parser] default html template</pre>"```, if it's an included template it will inject the include tag content (please see "Block Reference > Include" section).

### `VariableMissingInContext(varName: string)`: shows an error (in console) if a variable called in the template isn't defined in the context.

### `WrongTypeVariable(varName: string, actualType: string, exceptedType: string)`: shows an error (in console) if a variable isn't of the excepted type.

## Block Reference

### Variables

Syntax:
```
{{myVar}}
```

### Conditions (if)

Syntax:
```
{{#if myVar}}

    <!-- some code -->

{{/if}}
```

Nota: tags else if and else aren't planned to be implemented yet.

### Loops (for)

Syntax:
```
{{#for i in myArray}}

    <!-- some code-->

{{/for}}
```

### Include (include)

Syntax:
```
{{#include ./path/to/included/file.html}}
    <p>Couldn't load file.html</p>
{{/include}}
```

And that's it! You included this file. 

Nota: If the engine can't load the file it will display the block content.

Nota: the container file's context will apply to all included files.

## Contribute

This section describes more precisely how the parser works, and how you can contribute.

### Implement a new block

This parser parses templates with the help of regex.

All you have to do is adding your regex in a constant at the top of the `template-parser/handlers.ts`, write your handler function that calls the "replacing function" and return the template parsed.

Then you "register" your handler function into the `parse(template: string, context: string)`.

Let's see a little demonstration : how the for loops are implemented.

```ts
//...

const REGEX_FORLOOP = /{{#for\s+(\w+)\s+in\s+(\w+)}}([\s\S]*?){{\/for}}/g  // the regex that parses all for loops (you can test it on https://regex101.com/)

// ...

function forLoopHandler (template: string, context: Context) {  // the handler function
    return template.replace(REGEX_FORLOOP, (match, itemName, arrayName, content) => {  // the "replacing function"
        const items = context[arrayName]

        if (!items) new VariableMissingInContext(arrayName)

        if (Array.isArray(items)) {
            return items.map(item => {
                const newContext = { ...context }
                newContext[itemName] = item
                return parse(content, newContext)
            }).join('')
        }
        new WrongTypeVariable(arrayName, typeof arrayName, "Array")
        return ''
    })
}

// ...


export function parse (template: string, context: Context) {
    // ...
    template = forLoopHandler(template, context)  // that's what I'm talking about when I say "register"
    // ...
    return template
}
```

### Implement a new error

You can implement an error by writing a code like this in the `template-parser/errors.ts`:
```ts
export class MyError {
    constructor (arg1: string, arg2: string) {
        logError("MyError", `${arg1} and ${arg2} must........`)
    }
}
```
