import { Serverlet } from '../types.js'

/**
 * An HTTP endpoint, which knows how to handle one or more HTTP methods.
 * Returns `405 - Method Not Allowed` errors for unknown methods,
 * and adds a default `OPTIONS` handler if needed.
 */
export function pickMethod<T extends { readonly method: string }>(methods: {
  [method: string]: Serverlet<T>
}): Serverlet<T> {
  // Uppercase the method names:
  const cleanMethods: { [method: string]: Serverlet<T> } = {}
  for (const name of Object.keys(methods)) {
    cleanMethods[name.toUpperCase()] = methods[name]
  }

  // Add a default OPTIONS handler:
  if (cleanMethods.OPTIONS == null) {
    cleanMethods.OPTIONS = () => {
      return { status: 204, headers: optionsHeaders }
    }
  }
  const optionsHeaders = {
    'content-length': '0',
    allow: Object.keys(cleanMethods).join(', ')
  }

  return request => {
    const handler = cleanMethods[request.method]
    if (handler != null) return handler(request)
    return { status: 405, headers: optionsHeaders }
  }
}

/**
 * A router, which picks a server based on a URL.
 */
export function pickPath<T extends { readonly path: string }>(
  routes: { [path: string]: Serverlet<T> },
  fallback: Serverlet<T> = () => ({ status: 404 })
): Serverlet<T> {
  // Convert the routes to regular expressions:
  const table: Array<{ regexp: RegExp; server: Serverlet<T> }> = []
  for (const route of Object.keys(routes)) {
    table.push({
      regexp: new RegExp(`^${route}$`),
      server: routes[route]
    })
  }

  return request => {
    for (const { regexp, server } of table) {
      if (regexp.test(request.path)) return server(request)
    }
    return fallback(request)
  }
}
