import 'reflect-metadata'
import type { Constructor } from "./types"


const GLOBAL_CONTAINER_KEY = Symbol.for("global_container_instance")

export class Container {
    private services = new Map<string, Constructor<any>>()
    private instances: Map<string, any> = new Map()

    constructor() {
        if ((globalThis as any)[GLOBAL_CONTAINER_KEY]) {
            console.error("[ioc] error : container instance already exists. Use Container.getInstance()")
            return Container.getInstance()
        }
        (globalThis as any)[GLOBAL_CONTAINER_KEY] = this
    }

    public static getInstance(): Container {
        if (!(globalThis as any)[GLOBAL_CONTAINER_KEY]) {
            new Container()
        }
        return (globalThis as any)[GLOBAL_CONTAINER_KEY]
    }

    register<T>(key: string, implementation: Constructor<T>) {
        this.services.set(key, implementation)
    }

    public resolve<T>(name: string): T {
        if (this.instances.has(name)) {
            return this.instances.get(name)
        }
    
        const service = this.services.get(name)
        if (!service) throw new Error(`[ioc] error: ${name} wasn't registered`)
    
        const paramTypes = Reflect.getMetadata("design:paramtypes", service) || []

        const dependencies = paramTypes.map((type: Constructor) => this.resolve(type.name))
    
        const instance = new service(...dependencies)
        this.instances.set(name, instance)

        return instance
    }
}
