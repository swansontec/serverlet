# serverlet

[![Build Status](https://app.travis-ci.com/swansontec/serverlet.svg?branch=main)](https://app.travis-ci.com/swansontec/serverlet)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

A serverlet is a function that accepts an HTTP request and returns an HTTP response:

```js
const helloRoute = (request: HttpRequest): HttpResponse => {
  return {
    headers: { 'content-type': "text/plain" }
    body: 'Hello, world!'
  }
}
```

You can use a serverlet as an Express route:

```js
import { makeExpressRoute } from 'serverlet'

app.get('/', makeExpressRoute(helloRoute))
```

You can also use a serverlet to mock the `fetch` function:

```js
import { makeFetchFunction } from 'serverlet'

window.fetch = makeFetchFunction(helloRoute)

// Now run some tests...
```

You can also use a serverlet with Node.js's built-in HTTP server:

```js
import http from 'http'
import { makeNodeHandler, pickMethod } from 'serverlet'

const serverlet = pickMethod({
  GET: async request => ({
    status: 200,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ message: 'Hello' })
  })
})

const server = http.createServer(makeNodeHandler(serverlet))
server.listen(3000)
```

To stream the request body (for large uploads, proxying, etc.), iterate over the raw request:

```js
POST: async request => {
  for await (const chunk of request.req) {
    // Process each chunk as it arrives
    await processChunk(chunk)
  }
  return { status: 200 }
}
```

If streaming isn't needed, use the `withNodeReqBody` middleware to buffer the body:

```js
import { makeNodeHandler, withNodeReqBody, pickMethod } from 'serverlet'

const serverlet = withNodeReqBody(
  pickMethod({
    POST: async request => {
      // request.body is now available as Uint8Array
      const data = JSON.parse(Buffer.from(request.body).toString())
      return { status: 200, body: JSON.stringify(data) }
    }
  })
)
```

Of course, just serving a single route isn't very interesting. A more complete server will combine many serverlets together:

```js
import { pickPath, pickMethod, withCors } from 'serverlet'

const server = pickPath(
  {
    '/hello': withCors(helloRoute),
    '/api/user': pickMethod({
      GET: getUserRoute,
      POST: postUserRoute
    })
  },
  missingRoute
)
```

The `pickPath` and `pickMethod` helper functions combine multiple smaller serverlets together into a bigger serverlet, so the returned `server` is just another serverlet.

The `withCors` helper function is an example of a middleware. It accepts a serverlet, and returns an enhanced serverlet that sets the appropriate headers.

You can easily create your own middleware functions:

```js
export const withApiKey =
  (route: Serverlet): Serverlet =>
  request => {
    // Bail out if we don't have an API key:
    if (request.headers.authorization !== expectedApiKey) {
      return { status: 401 }
    }

    // Otherwise, run the route:
    return route(request)
  }
```

The `Serverlet` type is generic, so middleware can add properties to the request or response objects, and it's all type-safe.
