# validator

This module permits you to parse objects (like request, body) to verify if its processable.

## Usage

Here's a sign up view process using the validator module:

```ts
    const schema = await Schema.create({
        name: {
            "optional": ["John Doe"]  // you can set a default value if you want (if the field is empty, the default value will be set)
        },
        email: {
            "email": []
        },
        password: {
            "min": [8]
        }
    })
    const body = await schema.parse<SignupPayload>(await getPostBody(req))
    let user: ModelObject | null

    if (!body.success) {
        // error: the body doesn't math with the schema 
    }

    try {
        user = await User.create({
            name: body.data.name,
            email: body.data.email,
            password: body.data.password
        })
    } catch (err: any) {
        // error: error while creating user (email already taken, ...)
    }
```

The first part consists to defining our schema. The schema is an object which keys will be the fields of the parsed object (here, the request body). In each key, you can put an object containing the rules that the field must comply with.

A simple draft of what it means:
```
{
    field1: {
        rule1: ["rule1 param1", "rule1 param2"]
        rule2: ["rule2 param1"]
    },
    field2: {
        rule3: []
    }
}
```

Then comes the request parsing: `await schema.parse<SignupPayload>(await getPostBody(req))`

You specify in parameters of the async method `schema.parse()` the object to parse, and you must provide the output type.

Let's say that 
```ts
type SignupPayload = {
    name: string
    email: string
    password: string
}
```

To the `schema.parse()` output will be typed as

```ts
{
    success: boolean
    data: SignupPayload
}
```

So you can verify if the parsing is a success or not with `success`.

If the parsing is a success, you can get the parsed data by accessing to (in this example) `body.data`.

Note: if the parsing isn't valid, the `data` object will contain the errors of each field.

E.g: if the request body was something like 
```
{
    email: "e",
    password: "123"
}
```

the `schema.parse()` return would be

```
{
    success: false,
    data: {
        name: "",
        email: "Invalid email",
        password: "Text isn't long enough, excepted a 8 characters minimum text"
    }
}
```

## Validators directory

You can set your schemas in files contained into `src/validators`.

### Create custom rules

If you want to create a custom rule, you can create a file named `rules.ts` into `src/validators` (nota: the file name and path are required to be taken into account).

Then, begin to implement your rules!

```ts
import type { Rule } from "../modules/validator"

export const customRule = (str: string) => {
    return {
        name: "Custom rule name",
        errMsg: "Custom rule error message",
        cb: () => {
            if (/** your condition */) return true

            return false
        }
    } as Rule
}
```

Now you can easily use this rule in your schemas:

```ts
    // ...
    "customRule": [],
    // ...
```

Note: the first argument of the function is provided by the module, so in the schema declaration you MUST NOT set it as a rule param. The next arguments MUST be set into the schema declaration.

Here's an example:

```ts
export const myCustomMin = (str: string, min: number, foo: string) => {
    return {
        name: "Custom minimum string length",
        errMsg: "The string isn't long enough (custom rule)",
        cb: () => {
            console.log(foo)

            if (str.length >= min) return true

            return false
        }
    } as Rule
}
```

As you can see, we added a parameter named `min` and another named `foo`. In the schema, the declaration would look like this:
```ts
    // ...
    "myCustomMin": [
        8, // min param
        "bar" // foo param
    ],
    // ...
```

Please note that the params are handled in the order of declaration, do not put the foo param before the min param.
