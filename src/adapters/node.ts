import { IncomingMessage, RequestListener } from 'http'

import { HttpHeaders, HttpRequest, Serverlet } from '../types.js'

// The specific request type `makeNodeRoute` passes to its serverlet:
export interface NodeRequest extends HttpRequest {
  readonly req: IncomingMessage
}

/**
 * Converts a simple server function to an express.js route.
 */
export function makeNodeRoute(server: Serverlet<NodeRequest>): RequestListener {
  return async function route(
    req,
    res,
    // Supports an optional Express-style error handler:
    next?: (error: unknown) => void
  ) {
    const headers: HttpHeaders = {}
    for (const header of Object.keys(req.headers)) {
      const value = req.headers[header]
      if (typeof value === 'string') headers[header] = value
    }

    const url = new URL(
      req.url ?? '',
      `http://${req.headers.host ?? 'localhost'}`
    )
    const request: NodeRequest = {
      method: req.method ?? 'GET',
      path: url.pathname,
      version: `HTTP/${req.httpVersion}`,
      headers,
      req
    }

    try {
      const response = await server(request)
      const { status = 200, headers = {}, body } = response

      res.writeHead(status, headers)
      if (body == null) {
        res.end()
      } else if (typeof body === 'string') {
        res.end(body)
      } else {
        res.end(Buffer.from(body))
      }
    } catch (error) {
      if (typeof next === 'function') return next(error)
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      res.end(`Internal server error: ${String(error)}`)
    }
  }
}
