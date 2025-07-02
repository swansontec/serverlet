import type { Request, RequestHandler } from 'express'

import { HttpRequest, Serverlet } from '../types.js'
import { makeNodeRoute, NodeRequest } from './node.js'

// The specific request type `makeExpressRoute` passes to its serverlet:
export interface ExpressRequest extends HttpRequest {
  readonly req: Request
}

/**
 * Converts a simple server function to an express.js route.
 */
export function makeExpressRoute(
  server: Serverlet<ExpressRequest>
): RequestHandler {
  return makeNodeRoute(server as Serverlet<NodeRequest>)
}
