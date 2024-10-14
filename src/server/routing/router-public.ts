import express, { NextFunction, Request, Response } from 'express';
import proxy from 'express-http-proxy';

import { BffEndpoints } from './bff-routes';
import { queryParams } from './route-helpers';
import { OTAP_ENV } from '../../universal/config/env';
import {
  DATASETS,
  getDatasetCategoryId,
} from '../../universal/config/myarea-datasets';
import { AppRoutes } from '../../universal/config/routes';
import { HTTP_STATUS_CODES } from '../../universal/constants/errorCodes';
import { ApiResponse, apiSuccessResult } from '../../universal/helpers/api';
import { getAuth, getReturnToUrlZaakStatus } from '../auth/auth-helpers';
import { authRoutes } from '../auth/auth-routes';
import { RELEASE_VERSION } from '../config/app';
import {
  QueryParamsCMSFooter,
  fetchCMSCONTENT,
  fetchCmsFooter,
  fetchDataset,
  fetchSearchConfig,
  loadClusterDatasets,
  loadFeatureDetail,
  loadPolylineFeatures,
} from '../services';
import { getDatasetEndpointConfig } from '../services/buurt/helpers';
import {
  QueryParamsMaintenanceNotifications,
  fetchMaintenanceNotificationsActual,
} from '../services/cms-maintenance-notifications';

export const router = express.Router();

/**
 * Endpoint that serves CMS related content like Footer link/test content and Page data.
 */
router.get(BffEndpoints.CMS_CONTENT, async (req, res, next) => {
  const requestID = res.locals.requestID;
  try {
    const response = await fetchCMSCONTENT(
      requestID,
      queryParams<QueryParamsCMSFooter>(req)
    );
    return res.json(response);
  } catch (error) {
    next(error);
  }
});
/**
 * This endpoint serves the Footer content, transformed to AST, only.
 * A query parameters
 * - forceRenew=true Forces the underlying service cache to be renewed
 */
router.get(BffEndpoints.FOOTER, async (req, res, next) => {
  const requestID = res.locals.requestID;
  try {
    const response = await fetchCmsFooter(
      requestID,
      queryParams<QueryParamsCMSFooter>(req)
    );
    return res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * Serves the maintenance and outage notifications.
 */
router.get(
  BffEndpoints.CMS_MAINTENANCE_NOTIFICATIONS,
  async (req, res, next) => {
    const requestID = res.locals.requestID;
    try {
      const response = await fetchMaintenanceNotificationsActual(
        requestID,
        queryParams<QueryParamsMaintenanceNotifications>(req)
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
        res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
      }

      return res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// /**
//  * Zaak status endpoint redirects to zaakstatus if authenticated, else redirect to login
//  */
router.get(BffEndpoints.ZAAK_STATUS, zaakStatusHandler);

export async function zaakStatusHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authProfileAndToken = getAuth(req);
  const params = queryParams<{
    id: string;
    thema: string;
    'auth-type': string;
  }>(req);

  const redirectUrl = getReturnToUrlZaakStatus(params);

  if (authProfileAndToken) {
    return res.redirect(redirectUrl);
  }

  const authType =
    params['auth-type'] === 'eherkenning' ? 'EHERKENNING' : 'DIGID';
  const loginRoute = authRoutes[`AUTH_LOGIN_${authType}`];

  const loginRouteWithReturnTo = `${loginRoute}?returnTo=${AppRoutes.ZAAK_STATUS}&id=${params.id}&thema=${params.thema}`;

  return res.redirect(loginRouteWithReturnTo);
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

router.all(
  BffEndpoints.TELEMETRY_PROXY,
  proxy('https://westeurope-5.in.applicationinsights.azure.com', {
    memoizeHost: true,
    proxyReqPathResolver: function (req) {
      return '/v2/track';
    },
  })
);

export const legacyRouter = express.Router();

legacyRouter.get(BffEndpoints.LEGACY_LOGIN_API_LOGIN, (req, res) => {
  return res.redirect(authRoutes.AUTH_LOGIN_DIGID);
});

legacyRouter.get(BffEndpoints.LEGACY_LOGIN_API1_LOGIN, (req, res) => {
  return res.redirect(authRoutes.AUTH_LOGIN_EHERKENNING);
});
