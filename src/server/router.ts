import * as Sentry from '@sentry/node';
import express, { NextFunction, Request, Response } from 'express';
import { DatasetFilterSelection, DATASETS } from '../universal/config/buurt';
import { ApiResponse, apiSuccesResult } from '../universal/helpers/api';
import { BffEndpoints } from './config';
import { getPassthroughRequestHeaders, queryParams } from './helpers/app';
import { cacheOverview } from './helpers/file-cache';
import { fetchCMSCONTENT, loadClusterDatasets } from './services';
import {
  loadDatasetFeatures,
  loadFeatureDetail,
  loadPolylineFeatures,
} from './services/buurt/buurt';
import {
  filterDatasetFeatures,
  getDatasetEndpointConfig,
} from './services/buurt/helpers';
import {
  loadServicesAll,
  loadServicesSSE,
  loadServicesTips,
  loadServicesTipsRequestDataOverview,
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
  (req: Request, res: Response, next: NextFunction) => {
    // See https://nodejs.org/api/net.html#net_socket_setnodelay_nodelay
    req.socket.setNoDelay(true);
    // Tell the client we respond with an event stream
    res.writeHead(200, {
      'Content-type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    });

    res.write('retry: 1000\n');
    loadServicesSSE(req, res);
  }
);

router.get(BffEndpoints.SERVICES_TIPS, loadServicesTips);

// Function for easily extract the request data for the Tips service
router.get(
  BffEndpoints.SERVICES_TIPS_REQUEST_DATA_OVERVIEW,
  loadServicesTipsRequestDataOverview
);

router.post(
  BffEndpoints.MAP_DATASETS,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        clusters,
        errors: clusterErrors,
        filters: clusterFilters,
      } = await loadClusterDatasets(res.locals.sessionID, req.body);

      const {
        features: polylines,
        errors: polylineErrors,
        filters: polylineFilters,
      } = await loadPolylineFeatures(res.locals.sessionID, req.body);

      const responseContent = {
        clusters: clusters || [],
        polylines: polylines || [],
        errors: [...clusterErrors, ...polylineErrors],
        filters: {
          ...clusterFilters,
          ...polylineFilters,
        },
      };

      res.json(apiSuccesResult(responseContent));
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
    const datasetFilters = (req.query
      .filters as unknown) as DatasetFilterSelection;
    const datasetIds = (req.query.datasetIds as string)?.split(',') || [];
    const id = req.params.id;
    let response: ApiResponse<any> | null = null;
    try {
      if (datasetId && id) {
        response = await loadFeatureDetail(res.locals.sessionID, datasetId, id);
      } else {
        const ids = (datasetId ? [datasetId] : datasetIds).flatMap((id) =>
          DATASETS[id] ? Object.keys(DATASETS[id]) : id
        );
        const configs = getDatasetEndpointConfig(ids);
        const datasetData = await loadDatasetFeatures(
          res.locals.sessionID,
          configs
        );
        response = apiSuccesResult(datasetData);

        if (ids.length) {
          response.content.features = filterDatasetFeatures(
            datasetData.features,
            ids,
            datasetFilters
          );
        }
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
  BffEndpoints.CACHE_OVERVIEW,
  async (req: Request, res: Response, next: NextFunction) => {
    const overview = await cacheOverview();
    res.json(overview);
    next();
  }
);

router.get(
  BffEndpoints.HEALTH,
  (req: Request, res: Response, next: NextFunction) => {
    res.json({ status: 'OK' });
    next();
  }
);

router.get(BffEndpoints.CMS_CONTENT, async (req, res, next) => {
  const sessionID = res.locals.sessionID;
  try {
    const response = await fetchCMSCONTENT(
      sessionID,
      getPassthroughRequestHeaders(req),
      queryParams(req)
    );
    res.json(response);
  } catch (error) {
    Sentry.captureException(error);
  }
  next();
});
