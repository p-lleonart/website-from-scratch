import { RouteParams } from "#root/types"


export function patternToRegex(pattern: string): RegExp {
    const regexPattern = pattern.replace(/:([^/]+)/g, () => {
        return '([^/]+)'
    })
    return new RegExp(`^${regexPattern}$`)
}

export function extractRouteParams(match: RegExpMatchArray, pattern: string): RouteParams {
    const patternSpl = pattern.split('/')
    let result: RouteParams = {}

    let k = 1  // iterator for matches

    for (let i = 0; i < patternSpl.length; i++) {
        if (patternSpl[i].includes(':')) {
            const patternPartSpl = patternSpl[i].split(':')
            for (const j of patternPartSpl) {
                result[j] = match[k]
            }
            k++
        }
    }

    return result
}
