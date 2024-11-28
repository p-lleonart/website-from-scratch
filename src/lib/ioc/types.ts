import BaseController from "./base-controller"

export type Constructor<T = any> = new (...args: any[]) => T

export type Controllers = Record<string, BaseController>
