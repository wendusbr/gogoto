export interface Configs {
  method: string
  headers?: Record<string, string> | null
  body?: object | null
}

/**
 * - 0: error | null
 * - 1: response | null
 */
export type Result<T, E> = [E, null] | [null, T]

export function go<T = any, E = Record<string, any>>(
  url: string,
  configs: Configs,
): Promise<Result<T, E>>

export function goto<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>>
