import { Method } from 'axios';
import express, { NextFunction, Request, Response } from 'express';
import {
  DATASETS,
  getDatasetCategoryId,
} from '../universal/config/myarea-datasets';
import { ApiResponse, apiSuccessResult } from '../universal/helpers/api';
import { BffEndpoints, BFF_MS_API_BASE_URL } from './config';
import {
  getAuth,
  isProtectedRoute,
  isRelayAllowed,
  queryParams,
} from './helpers/app';
import { axiosRequest } from './helpers/source-api-request';
import { isAuthenticated } from './router-auth';
import { fetchSearchConfig, loadClusterDatasets } from './services';
import {
  fetchDataset,
  loadFeatureDetail,
  loadPolylineFeatures,
} from './services/buurt/buurt';
import { getDatasetEndpointConfig } from './services/buurt/helpers';
import {
  loadServicesAll,
  loadServicesSSE,
  loadServicesTips,
  loadServicesTipsRequestDataOverview,
} from './services/controller';

export const router = express.Router();

router.use((req: Request, res: Response, next: NextFunction) => {
  // Skip router if we've entered a public route.
  if (!isProtectedRoute(req.path)) {
    return next('router');
  }
  return next();
}, isAuthenticated());

router.get(
  BffEndpoints.SEARCH_CONFIG,
  async (req: Request, res: Response, next: NextFunction) => {
    const requestID = res.locals.requestID;
    try {
      const response = await fetchSearchConfig(
        requestID,
        await getAuth(req),
        queryParams(req)
      );
      res.json(response);
      next();
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  BffEndpoints.SERVICES_ALL,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await loadServicesAll(req, res);
      res.json(response);
      next();
    } catch (error) {
      next(error);
    }
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
      } = await loadClusterDatasets(res.locals.requestID, req.body);

      const {
        features: polylines,
        errors: polylineErrors,
        filters: polylineFilters,
      } = await loadPolylineFeatures(res.locals.requestID, req.body);

      const responseContent = {
        clusters: clusters || [],
        polylines: polylines || [],
        errors: [...clusterErrors, ...polylineErrors],
        filters: {
          ...clusterFilters,
          ...polylineFilters,
        },
      };

      res.json(apiSuccessResult(responseContent));
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
    const datasetCategoryId = getDatasetCategoryId(datasetId);

    let response: ApiResponse<any> | null = null;

    try {
      if (datasetCategoryId && datasetId && id) {
        response = await loadFeatureDetail(res.locals.requestID, datasetId, id);
      } else if (
        datasetCategoryId &&
        datasetId &&
        DATASETS?.[datasetCategoryId].datasets?.[datasetId]
      ) {
        const [[, datasetConfig]] = getDatasetEndpointConfig([datasetId]);
        response = await fetchDataset(
          res.locals.requestID,
          datasetId,
          datasetConfig,
          {},
          !!req.query?.pruneCache
        );
      }

      if (response?.status !== 'OK') {
        res.status(500);
      }

      res.json(response);
      next();
    } catch (error) {
      next(error);
    }
  }
);

router.use(BffEndpoints.API_RELAY, async (req, res, next) => {
  if (isRelayAllowed(req.path)) {
    let headers: any = req.headers;

    // TODO: Generalize endpoints that don't need auth
    if (!req.path.includes('tip_images')) {
      const { token } = await getAuth(req);
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const url = `${BFF_MS_API_BASE_URL + req.path}`;
      const rs = await axiosRequest.request({
        method: req.method as Method,
        url,
        headers,
        params: req.query,
      });
      res.type(rs.headers?.['Content-type'] || 'application/json');
      res.send(rs.data);
    } catch (error: any) {
      res.status(error?.response?.status || 500);
      res.json(error.message || 'Error requesting api data');
    }
  }

  next();
});
