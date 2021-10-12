// @flow

declare class express$Request extends http$IncomingMessage {}

declare type express$Middleware = (
  req: express$Request,
  res: any,
  next: any
) => mixed
