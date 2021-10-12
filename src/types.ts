export interface HttpHeaders {
  [header: string]: string
}

export interface HttpResponse {
  readonly status?: number
  readonly headers?: HttpHeaders
  readonly body?: string | Uint8Array // | AsyncIterator<Uint8Array>
}

export interface HttpRequest {
  readonly method: string
  readonly path: string
  readonly version: string // 'HTTP/1.1'
  readonly headers: HttpHeaders
  // readonly body: AsyncIterableIterator<Uint8Array>
}

/**
 * A serverlet is just an async function that takes some type of request
 * and returns an HttpResponse:
 */
export type Serverlet<Request, Response extends HttpResponse = HttpResponse> = (
  request: Request
) => Response | Promise<Response>
