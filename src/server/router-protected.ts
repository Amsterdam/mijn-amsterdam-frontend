import { Method } from 'axios';
import express, { NextFunction, Request, Response } from 'express';
import {
  DATASETS,
  getDatasetCategoryId,
} from '../universal/config/myarea-datasets';
import { ApiResponse, apiSuccessResult } from '../universal/helpers/api';
import {
  ApiConfig,
  BffEndpoints,
  BFF_MS_API_BASE_URL,
  getApiConfig,
  SourceApiKey,
} from './config';
import { getAuth, isRelayAllowed, queryParams } from './helpers/app';
import { axiosRequest } from './helpers/source-api-request';
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

router.get(
  BffEndpoints.SEARCH_CONFIG,
  async (req: Request, res: Response, next: NextFunction) => {
    const requestID = res.locals.requestID;
    try {
      const response = await fetchSearchConfig(
        requestID,
        getAuth(req),
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

router.get(BffEndpoints.API_DIRECT, async (req, res, next) => {
  const apiName = req.params.apiName;
  if (apiName && apiName in ApiConfig) {
    const authProfileAndToken = getAuth(req);
    // TODO: Which header key to use here?
    const headers = {
      token: authProfileAndToken.token,
    };
    try {
      const rs = await axiosRequest.request(
        getApiConfig(apiName as SourceApiKey, {
          headers,
        })
      );
      res.json(rs.data);
    } catch (error: any) {
      res.status(error?.response?.status || 500);
      res.json(error.message || 'Error requesting api data');
    }
  }

  next();
});

router.use('/relay', async (req, res, next) => {
  if (isRelayAllowed(req.path)) {
    const authProfileAndToken = getAuth(req);
    // TODO: Which header key to use here?
    const headers = {
      token: authProfileAndToken.token,
    };
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
