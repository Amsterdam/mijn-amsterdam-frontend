import express, { NextFunction, Request, Response } from 'express';
import { BffEndpoints } from './config';
import { loadServicesTips } from './services';

export const routerCommon = express.Router();

routerCommon.get(BffEndpoints.SERVICES_TIPS, async function handleRouteTips(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const tipsResult = await loadServicesTips(res.locals.sessionID, req);
    res.json(tipsResult);
    next();
  } catch (error) {
    console.log('erroir', error);
    next(error);
  }
});

routerCommon.get(
  BffEndpoints.HEALTH,
  (req: Request, res: Response, next: NextFunction) => {
    res.json({ status: 'OK' });
    next();
  }
);
