import express, { NextFunction, Request, Response } from 'express';
import { BffEndpoints } from './config';
import {
  loadServicesAll,
  loadServicesSSE,
  loadServicesTips,
} from './services/controller';

export const router = express.Router();

router.get(
  BffEndpoints.SERVICES_ALL,
  async (req: Request, res: Response, next: NextFunction) => {
    const response = await loadServicesAll(req, res);
    res.json(response);
    next();
  }
);
router.get(BffEndpoints.SERVICES_STREAM, loadServicesSSE);
router.get(BffEndpoints.SERVICES_TIPS, loadServicesTips);

router.get(
  BffEndpoints.HEALTH,
  (req: Request, res: Response, next: NextFunction) => {
    res.json({ status: 'OK' });
    next();
  }
);
