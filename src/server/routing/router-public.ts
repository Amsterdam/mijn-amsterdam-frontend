import { HttpStatusCode } from 'axios';
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
import {
  ApiResponse_DEPRECATED,
  apiSuccessResult,
} from '../../universal/helpers/api';
import {
  getAuth,
  getReturnToUrlZaakStatus,
  getZaakStatusQueryParams,
} from '../auth/auth-helpers';
import { authRoutes } from '../auth/auth-routes';
import { RELEASE_VERSION } from '../config/app';
import { getFromEnv } from '../helpers/env';
import {
  fetchDataset,
  loadFeatureDetail,
  loadPolylineFeatures,
} from '../services/buurt/buurt';
import { getDatasetEndpointConfig } from '../services/buurt/helpers';
import { loadClusterDatasets } from '../services/buurt/supercluster';
import {
  fetchCMSCONTENT,
  QueryParamsCMSFooter,
  fetchCmsFooter,
  fetchSearchConfig,
} from '../services/cms/cms-content';
import {
  fetchMaintenanceNotificationsActual,
  QueryParamsMaintenanceNotifications,
} from '../services/cms/cms-maintenance-notifications';

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

    let response: ApiResponse_DEPRECATED<any> | null = null;

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
        res.status(HttpStatusCode.InternalServerError);
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
  const loginRouteWithReturnTo = `${loginRoute}?returnTo=${AppRoutes.ZAAK_STATUS}${getZaakStatusQueryParams(params)}`;
  return res.redirect(loginRouteWithReturnTo);
}

const gitSHA = getFromEnv('MA_GIT_SHA', false) ?? -1;

router.get(
  [BffEndpoints.ROOT, BffEndpoints.STATUS_HEALTH],
  (_req: Request, res: Response) => {
    return res.json({
      status: 'OK',
      otapEnv: OTAP_ENV,
      release: RELEASE_VERSION,
      gitSha: gitSHA,
      gitShaUrl: `https://github.com/Amsterdam/mijn-amsterdam-frontend/commit/${gitSHA}`,
      buildId: process.env.MA_BUILD_ID ?? 'unknown',
      instanceId: process.env.WEBSITE_INSTANCE_ID ?? 'unknown',
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
