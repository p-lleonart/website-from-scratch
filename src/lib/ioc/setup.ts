import { readdirSync } from 'fs'
import { Container } from './container'
import BaseController from './base-controller'


function isSubclassOf(childConstructor: Function, parentConstructor: Function): boolean {
    let currentConstructor = childConstructor
    
    while (currentConstructor) {
        if (currentConstructor.name === parentConstructor.name) {
            return true
        }
        currentConstructor = Object.getPrototypeOf(currentConstructor)
    }
  
    return false
}

async function loadAndResolveControllers() {
    const container = Container.getInstance()
    const controllersDir = './dist/controllers'
    const controllerDirForImport = controllersDir.split('/dist').join('')
    let resolvedControllers: { [key: string]: BaseController } = {}

    return await new Promise<{ [key: string]: BaseController }>(async (resolve) => {
        const files = readdirSync(controllersDir)

        for (const file of files) {
            if (file.endsWith('.js')) {
                const controllerModule = await import(`${controllerDirForImport}/${file}`)

                for (const exportedClass in controllerModule) {
                    const controller = controllerModule[exportedClass]
                    
                    // verifies that the class is a controller
                    if (!isSubclassOf(controller, BaseController))
                        continue

                    // case where the controller is injectable or has deps
                    if (typeof controller === 'function' && Reflect.hasMetadata("design:paramtypes", controller)) {
                        container.register(controller.name, controller)
                        resolvedControllers[controller.name] = container.resolve(controller.name)
                    } else if (typeof controller === 'function') {  // case where the controller doesn't have deps
                        resolvedControllers[controller.name] = new controller()
                    }
                }
            }
        }
        resolve(resolvedControllers)
    })
}

export async function setupContainer() {
    return await loadAndResolveControllers()
}
