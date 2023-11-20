import express, { NextFunction, Request, Response } from 'express';
import basicAuth from 'express-basic-auth';
import {
  DATASETS,
  IS_OT,
  OTAP_ENV,
  getDatasetCategoryId,
} from '../universal/config';
import { ApiResponse, apiSuccessResult, jsonCopy } from '../universal/helpers';
import { BffEndpoints, RELEASE_VERSION } from './config';
import { queryParams } from './helpers/app';
import { cacheOverview } from './helpers/file-cache';
import {
  fetchCMSCONTENT,
  fetchDataset,
  fetchSearchConfig,
  loadClusterDatasets,
  loadFeatureDetail,
  loadPolylineFeatures,
} from './services';
import { getDatasetEndpointConfig } from './services/buurt/helpers';
import { fetchMaintenanceNotificationsActual } from './services/cms-maintenance-notifications';
import { loginStats, rawDataTable } from './services/visitors';
import { generateOverview } from './generate-user-data-overview';

export const router = express.Router();

router.get(
  BffEndpoints.CACHE_OVERVIEW,
  async (req: Request, res: Response, next: NextFunction) => {
    const overview = await cacheOverview();
    return res.json(overview);
  }
);

router.get(BffEndpoints.CMS_CONTENT, async (req, res, next) => {
  const requestID = res.locals.requestID;
  try {
    const response = await fetchCMSCONTENT(requestID, queryParams(req));
    return res.json(response);
  } catch (error) {
    next(error);
  }
});

router.get(
  BffEndpoints.CMS_MAINTENANCE_NOTIFICATIONS,
  async (req, res, next) => {
    const requestID = res.locals.requestID;
    try {
      const response = await fetchMaintenanceNotificationsActual(
        requestID,
        queryParams(req)
      );
      return res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  BffEndpoints.SEARCH_CONFIG,
  async (req: Request, res: Response, next: NextFunction) => {
    const requestID = res.locals.requestID;
    try {
      const response = await fetchSearchConfig(requestID, queryParams(req));
      return res.json(response);
    } catch (error) {
      next(error);
    }
  }
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

      return res.json(apiSuccessResult(responseContent));
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

      return res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

if (process.env.BFF_LOGIN_COUNT_ADMIN_PW) {
  const auth = basicAuth({
    users: {
      admin: process.env.BFF_LOGIN_COUNT_ADMIN_PW,
    },
    challenge: true,
  });
  router.get(BffEndpoints.LOGIN_RAW, auth, rawDataTable);
  router.get(BffEndpoints.LOGIN_STATS, auth, loginStats);

  // Currently this endpoint can only be used when running the application locally.
  // Requesting the endpoint on Azure results in a Gateway timeout which cannot be prevented easily at this time.
  router.get(BffEndpoints.USER_DATA_OVERVIEW, auth, async (req, res) => {
    generateOverview(req.query.fromCache == '1', `${__dirname}/cache`).then(
      (fileName) => {
        res.download(fileName);
      }
    );
  });
}

router.get(
  [BffEndpoints.ROOT, BffEndpoints.STATUS_HEALTH],
  (req: Request, res: Response, next: NextFunction) => {
    return res.json({
      status: 'OK',
      otapEnv: OTAP_ENV,
      release: RELEASE_VERSION,
      gitSha: process.env.MA_GIT_SHA ?? '-1',
      buildId: process.env.MA_BUILD_ID ?? '-1',
    });
  }
);
