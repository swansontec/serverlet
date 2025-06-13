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

Of course, just serving a single route isn't very interesting. A more complete server will combine many serverlets together:

```js
import { pickPath, pickMethod, withCors } from 'serverlet'

const server = pickPath({
  '/hello': withCors(helloRoute),
  '/api/user': pickMethod({
    GET: getUserRoute,
    POST: postUserRoute
  })
}, missingRoute)
```

The `pickPath` and `pickMethod` helper functions combine multiple smaller serverlets together into a bigger serverlet, so the returned `server` is just another serverlet.

The `withCors` helper function is an example of a middleware. It accepts a serverlet, and returns an enhanced serverlet that sets the appropriate headers.

You can easily create your own middleware functions:

```js
export const withApiKey = (route: Serverlet): Serverlet => request => {
  // Bail out if we don't have an API key:
  if (request.headers.authorization !== expectedApiKey) {
    return { status: 401 }
  }

  // Otherwise, run the route:
  return route(request)
}
```

The `Serverlet` type is generic, so middleware can add properties to the request or response objects, and it's all type-safe.
