import { HttpHeaders, HttpRequest, HttpResponse, Serverlet } from '../types.js'
import { utf8 } from '../util/utf8.js'

/**
 * The specific serverlet request type `makeFetchFunction` expects.
 */
export interface FetchRequest extends HttpRequest {
  readonly body: Uint8Array
}

export type FetchServerlet = Serverlet<FetchRequest>

/**
 * The subset of the `fetch` options we guarantee to support.
 */
export interface FetchOptions {
  method?: string
  body?: ArrayBuffer | string
  headers?: { [header: string]: string }
}

/**
 * The subset of the `Headers` DOM object we guarantee to support.
 */
export interface FetchHeaders {
  // We do not pass `self` to be a subset of `@types/node-fetch@2.5.12`
  forEach: (
    callback: (value: string, name: string /*, self: FetchHeaders */) => void,
    thisArg?: any
  ) => void
  get: (name: string) => string | null
  has: (name: string) => boolean
}

/**
 * The subset of the `Response` DOM object we guarantee to support.
 */
export interface FetchResponse {
  readonly headers: FetchHeaders
  readonly ok: boolean
  readonly status: number
  arrayBuffer: () => Promise<ArrayBuffer>
  json: () => Promise<any>
  text: () => Promise<string>
}

/**
 * The subset of the `fetch` DOM function we guarantee to support.
 */
export type FetchFunction = (
  uri: string,
  opts?: FetchOptions
) => Promise<FetchResponse>

/**
 * Wraps a serverlet function in the fetch API.
 */
export function makeFetchFunction(
  serverlet: Serverlet<FetchRequest>
): FetchFunction {
  return async function fetch(
    uri: string,
    opts: FetchOptions = {}
  ): Promise<FetchResponse> {
    const { body = '', method = 'GET', headers = {} } = opts

    const request: FetchRequest = {
      method,
      path: uri.replace(/https?:\/\/[^/]*/, ''),
      version: 'HTTP/1.1',
      headers,
      body: typeof body === 'string' ? utf8.parse(body) : new Uint8Array(body)
    }
    const response = await serverlet(request)
    return makeFetchResponse(response)
  }
}

/**
 * Turns a serverlet response into a fetch-style `Response` object.
 */
export function makeFetchResponse(response: HttpResponse): FetchResponse {
  const { body = '', headers = {}, status = 200 } = response
  // Use a promise wrapper to make all exceptions async:
  const bodyPromise = Promise.resolve(body)

  const out: FetchResponse = {
    headers: makeFetchHeaders(headers),
    ok: status >= 200 && status < 300,
    status,

    async arrayBuffer(): Promise<ArrayBuffer> {
      return await bodyPromise.then(body =>
        typeof body === 'string' ? utf8.parse(body).buffer : body
      )
    },

    async json() {
      return await out.text().then(text => JSON.parse(text))
    },

    async text() {
      return await bodyPromise.then(body =>
        typeof body === 'string' ? body : utf8.stringify(new Uint8Array(body))
      )
    }
  }
  return out
}

/**
 * Turns a simple key-value map into a fetch-style `Headers` object.
 */
function makeFetchHeaders(headers: HttpHeaders): FetchHeaders {
  const out: FetchHeaders = {
    forEach(callback, thisArg) {
      for (const name of Object.keys(headers)) {
        callback.call(thisArg, headers[name], name)
      }
    },

    get(name) {
      if (!out.has(name)) return null
      return headers[name]
    },

    has(name) {
      return Object.prototype.hasOwnProperty.call(headers, name)
    }
  }
  return out
}
