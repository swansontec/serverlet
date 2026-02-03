import { NodeRequest } from '../adapters/node.js'
import { Serverlet } from '../types.js'

export interface NodeRequestWithBody extends NodeRequest {
  readonly body: Uint8Array
}

/**
 * Middleware that buffers the request body and adds it to the request object.
 * Use this when streaming isn't needed.
 */
export const withNodeReqBody =
  <T extends NodeRequest>(
    server: Serverlet<T & { body: Uint8Array }>
  ): Serverlet<T> =>
  async request => {
    const chunks: Buffer[] = []
    for await (const chunk of request.req) {
      chunks.push(chunk)
    }
    const body = new Uint8Array(Buffer.concat(chunks))
    return await server({ ...request, body })
  }
