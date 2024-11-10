import { BaseService, Inject, Injectable } from "#lib/ioc"


@Injectable()
export class SecondService extends BaseService {
    public someAction() {
        return "hello, world"
    }
}

@Injectable()
export class TestDIService extends BaseService {
    constructor(@Inject(SecondService) protected secondService: SecondService) {
        super()
    }

    public getData(param: string) {
        return { param, action: this.secondService.someAction() }
    }
}
