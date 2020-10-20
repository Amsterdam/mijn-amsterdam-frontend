import express, { NextFunction, Request, Response } from 'express';
import { BffEndpoints } from './config';
import {
  loadDataset,
  loadServicesMapDatasetItem,
  loadServicesMapDatasets,
  loadServicesMapWms,
} from './services';
import {
  loadServicesAll,
  loadServicesSSE,
  loadServicesTips,
} from './services/controller';
import * as Sentry from '@sentry/node';

export const router = express.Router();

router.get(
  BffEndpoints.SERVICES_ALL,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await loadServicesAll(req, res);
      res.json(response);
    } catch (error) {
      Sentry.captureException(error);
    }
    next();
  }
);
router.get(
  BffEndpoints.SERVICES_STREAM,
  async (req: Request, res: Response, next: NextFunction) => {
    // Tell the client we respond with an event stream
    res.writeHead(200, {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache',
      connection: 'keep-alive',
    });
    try {
      await loadServicesSSE(req, res);
    } catch (error) {
      Sentry.captureException(error);
    }
    next();
  }
);
router.get(BffEndpoints.SERVICES_TIPS, loadServicesTips);

router.get(
  BffEndpoints.MAP_DATASETS,
  async (req: Request, res: Response, next: NextFunction) => {
    const datasetId = req.params.dataset;
    try {
      if (!datasetId) {
        res.json(await loadServicesMapDatasets(res.locals.sessionID));
      } else {
        res.json(await loadDataset(res.locals.sessionID, datasetId));
      }
      next();
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  BffEndpoints.MAP_DATASETS_WMS,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const datasetItem = await loadServicesMapWms(
        res.locals.sessionID,
        req.params.dataset
      );
      res.json(datasetItem);
      next();
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  BffEndpoints.MAP_DATASETS_ITEM,
  async (req: Request, res: Response, next: NextFunction) => {
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
