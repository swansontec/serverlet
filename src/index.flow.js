// @flow

// serverlet ------------------------------------------------------------------

export type HttpHeaders = {
  [header: string]: string
}

export type HttpResponse = {
  +status?: number,
  +headers?: HttpHeaders,
  +body?: string | Uint8Array // | AsyncIterator<Uint8Array>
}

export type HttpRequest = {
  +method: string,
  +path: string,
  +version: string, // 'HTTP/1.1'
  +headers: HttpHeaders
  // +body: AsyncIterableIterator<Uint8Array>
}

export type Serverlet<Request, Response: HttpResponse = HttpResponse> = (
  request: Request
) => Response | Promise<Response>

// fetch adapter -------------------------------------------------------------

export type FetchRequest = {
  ...HttpRequest,
  +body: Uint8Array
}

export type FetchOptions = {
  method?: string,
  body?: ArrayBuffer | string,
  headers?: { [header: string]: string }
}

export type FetchHeaders = {
  forEach: (
    callback: (value: string, name: string /*, self: FetchHeaders */) => void,
    thisArg?: any
  ) => void,
  get: (name: string) => string | null,
  has: (name: string) => boolean
}

export type FetchResponse = {
  +headers: FetchHeaders,
  +ok: boolean,
  +status: number,
  arrayBuffer: () => Promise<ArrayBuffer>,
  json: () => Promise<any>,
  text: () => Promise<string>
}

export type FetchFunction = (
  uri: string,
  opts?: FetchOptions
) => Promise<FetchResponse>

// functions -----------------------------------------------------------------

declare export function makeFetchFunction(
  serverlet: Serverlet<FetchRequest>
): FetchFunction

declare export function makeFetchResponse(response: HttpResponse): FetchResponse

declare export function pickMethod<T: { +method: string }>(methods: {
  [method: string]: Serverlet<T>
}): Serverlet<T>

declare export function pickPath<T: { +path: string }>(
  routes: { [path: string]: Serverlet<T> },
  fallback?: Serverlet<T>
): Serverlet<T>

declare export function withCors<T>(server: Serverlet<T>): Serverlet<T>
