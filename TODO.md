# TODO

Features:
- auth & csrf (check safety & cleaning token system)
- setup project for node 22 (suppress sqlite3 dependency)
- add better build system (tsc)
- routing system mustbe in a json file: (route_list cmd won't need compilation anymore)
```json
{
    "GET:/": {
        "callback": "funcName to find in ./src/controllers/index.ts"
    }
}```
- improve middleware logic
