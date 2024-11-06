import { ROUTES } from "#app/routes"


let routesToDisplay: { [key: string]: { [key: string]: string } } = {}

for (const endpoint of Object.keys(ROUTES)) {
    const description = ROUTES[endpoint].description ? ROUTES[endpoint].description.slice(0, 40) : 'route'
    let middlewares: string = ""

    if (ROUTES[endpoint].middlewares) {
        for (const m of ROUTES[endpoint].middlewares) {
            middlewares += `${m.constructor.name},`
        }
        middlewares = middlewares.slice(0, -1)
    }
    routesToDisplay[endpoint.split(':')[1]] = {
        method: endpoint.split(':')[0],
        description,
        middlewares: middlewares !== "" ? middlewares : "none"
    }
}

console.table(routesToDisplay, ["method", "description", "middlewares"])
