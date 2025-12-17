import type { NextFunction } from 'express';

export function conditional<Req extends any, Res extends any>(
  flag: boolean,
  middleware: (req: Req, res: Res, next: NextFunction) => any
) {
  return (req: Req, res: Res, next: NextFunction) => {
    if (flag) {
      return middleware(req, res, next);
    }
    return next();
  };
}
