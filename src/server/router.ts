import express, { NextFunction, Request, Response } from 'express';
import { BffEndpoints } from './config';
import {
  loadServicesMapDatasetItem,
  loadServicesMapDatasets,
} from './services';
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
  BffEndpoints.MAP_DATASETS,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const datasets = await loadServicesMapDatasets(res.locals.sessionID);
      res.json(datasets);
      next();
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  BffEndpoints.MAP_DATASETS_ITEM,
  async (req: Request, res: Response, next: NextFunction) => {
    console.log('params', req.params);
    try {
      const datasetItem = await loadServicesMapDatasetItem(
        res.locals.sessionID,
        req.params.dataset,
        req.params.id
      );
      res.json(datasetItem);
      next();
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  BffEndpoints.HEALTH,
  (req: Request, res: Response, next: NextFunction) => {
    res.json({ status: 'OK' });
    next();
  }
);
