import * as Sentry from '@sentry/node';
import express, { NextFunction, Request, Response } from 'express';
import { BffEndpoints } from './config';
import {
  loadClusterDatasets,
  loadServicesMapDatasetItem,
  loadServicesMapDatasets,
} from './services';
import { loadPolyLineDatasets } from './services/buurt/buurt';
import { ApiResponse, apiSuccesResult } from '../universal/helpers/api';
import {
  loadServicesAll,
  loadServicesSSE,
  loadServicesTips,
} from './services/controller';

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

router.post(
  BffEndpoints.MAP_DATASETS,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clusters = await loadClusterDatasets(
        res.locals.sessionID,
        req.body
      );
      const polylines = await loadPolyLineDatasets(
        res.locals.sessionID,
        req.body.datasetIds
      );
      res.json(apiSuccesResult([...clusters, ...polylines]));
      next();
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  BffEndpoints.MAP_DATASETS,
  async (req: Request, res: Response, next: NextFunction) => {
    const datasetId = req.params.datasetId;
    const id = req.params.id;
    let response: ApiResponse<any> | null = null;
    try {
      if (datasetId && id) {
        response = await loadServicesMapDatasetItem(
          res.locals.sessionID,
          datasetId,
          id
        );
      } else {
        response = await loadServicesMapDatasets(
          res.locals.sessionID,
          datasetId
        );
      }
      if (response.status !== 'OK') {
        res.status(500);
      }
      res.json(response);
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
