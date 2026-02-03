import type { IncomingMessage, ServerResponse } from 'http'

import { HttpHeaders, HttpRequest, Serverlet } from '../types.js'

// The specific request type `makeNodeHandler` passes to its serverlet:
export interface NodeRequest extends HttpRequest {
  readonly req: IncomingMessage
}

/**
 * Converts a simple server function to a Node.js HTTP handler.
 */
export function makeNodeHandler(
  server: Serverlet<NodeRequest>
): (req: IncomingMessage, res: ServerResponse) => void {
  return async function handler(req, res) {
    const headers: HttpHeaders = {}
    for (const header of Object.keys(req.headers)) {
      const value = req.headers[header]
      if (typeof value === 'string') headers[header] = value
    }
    const request: NodeRequest = {
      method: req.method ?? 'GET',
      path: req.url ?? '/',
      version: `HTTP/${req.httpVersion}`,
      headers,
      req
    }

    try {
      const response = await server(request)
      const { status = 200, headers = {}, body } = response

      res.statusCode = status
      for (const header of Object.keys(headers)) {
        res.setHeader(header, headers[header])
      }
      if (body == null) {
        res.end()
      } else if (typeof body === 'string') {
        res.end(body)
      } else {
        res.end(Buffer.from(body))
      }
    } catch (error) {
      res.statusCode = 500
      res.end()
    }
  }
}
