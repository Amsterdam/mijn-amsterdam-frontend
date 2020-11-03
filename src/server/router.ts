import * as Sentry from '@sentry/node';
import express, { NextFunction, Request, Response } from 'express';
import { ApiResponse, apiSuccesResult } from '../universal/helpers/api';
import { BffEndpoints } from './config';
import { loadClusterDatasets } from './services';
import {
  loadPolyLineFeatures,
  loadFeatureDetail,
  loadDatasetFeatures,
} from './services/buurt/buurt';
import { getDatasetEndpointConfig } from './services/buurt/helpers';
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
      const polylines = await loadPolyLineFeatures(
        res.locals.sessionID,
        req.body
      );
      res.json(apiSuccesResult([...(clusters || []), ...(polylines || [])]));
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
    const datasetIds = (req.query.datasetIds as string)?.split(',') || [];
    const id = req.params.id;
    let response: ApiResponse<any> | null = null;
    try {
      if (datasetId && id) {
        response = await loadFeatureDetail(res.locals.sessionID, datasetId, id);
      } else {
        const configs = getDatasetEndpointConfig(datasetIds);
        response = await loadDatasetFeatures(res.locals.sessionID, configs);
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
