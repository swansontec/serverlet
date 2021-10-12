// @flow

import { type HttpRequest, type Serverlet } from '../index.flow.js'

export type ExpressRequest = {
  ...HttpRequest,
  +req: express$Request
}

declare export function makeExpressServer(
  server: Serverlet<ExpressRequest>
): express$Middleware
