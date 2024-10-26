# TODO

Features:
- csrf (check safety)
- implement basic boole algebra in template-parser
- convert request into a class (in progress)
- setup project for node 22 (suppress sqlite3 dependency)
- proxy for models in database module
- add better build system (tsc)
- routing system mustbe in a json file: (route_list cmd won't need compilation anymore)
```json
{
    "GET:/": {
        "callback": "funcName to find in ./src/controllers/index.ts"
    }
}```
