import { BaseController, Inject } from "#lib/ioc"
import { HttpContext } from "#root/types"
import { TestDIService, SecondService } from "#app/services/test-di"


// we put it here to verify that only classes extending BaseController are registered in the controllers object
export class MyUtilClass {}

// i put two controllers here to test if the controller loader could get them

export class TestDIController extends BaseController {
    constructor(@Inject(TestDIService) protected testDIService: TestDIService) {
        super()
    }

    public myView({ response }: HttpContext) {
        return response.setResponse({
            body: JSON.stringify(this.testDIService.getData("hello there")),
            contentType: "application/json"
        })
    }
}


export class TestDI2Controller extends BaseController {
    constructor(
        @Inject(TestDIService) protected testDIService: TestDIService,
        @Inject(SecondService) protected secondService: SecondService
    ) {
        super()
    }

    public myView({ response }: HttpContext) {
        console.log(this.secondService.someAction())
        return response.setResponse({
            body: JSON.stringify(this.testDIService.getData("hello there")),
            contentType: "application/json"
        })
    }
}
