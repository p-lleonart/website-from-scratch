import 'reflect-metadata'
import { Container } from './container'


export function Injectable() {
    return function (target: any) {
        const container = Container.getInstance()
        container.register(target.name, target)
    }
}

export const Inject = (service: any) => {
    return (target: any, _: string | symbol = "", parameterIndex: number) => {
        const existingInjectedServices: any[] = Reflect.getOwnMetadata("design:paramtypes", target) || []
        existingInjectedServices[parameterIndex] = service
        Reflect.defineMetadata("design:paramtypes", existingInjectedServices, target)
    }
}
