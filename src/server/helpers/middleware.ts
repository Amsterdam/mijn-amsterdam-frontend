import type { NextFunction } from 'express';

export function conditional<Req, Res>(
  flag: boolean,
  middleware: (req: Req, res: Res, next: NextFunction) => unknown
) {
  return (req: Req, res: Res, next: NextFunction) => {
    if (flag) {
      return middleware(req, res, next);
    }
    return next();
  };
}
