import { HttpStatusCode } from 'axios';
import express, { NextFunction, Request, Response } from 'express';
import proxy, { ProxyOptions } from 'express-http-proxy';

import { BffEndpoints } from './bff-routes';
import { queryParams, type RequestWithQueryParams } from './route-helpers';
import { ZAAK_STATUS_ROUTE } from '../../client/pages/ZaakStatus/ZaakStatus-config';
import { OTAP_ENV } from '../../universal/config/env';
import {
  DATASETS,
  getDatasetCategoryId,
} from '../../universal/config/myarea-datasets';
import {
  ApiResponse_DEPRECATED,
  apiSuccessResult,
} from '../../universal/helpers/api';
import {
  OIDC_SESSION_COOKIE_NAME,
  OIDC_SESSIONS_TABLE_NAME,
} from '../auth/auth-config';
import {
  destroySession,
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
import { fetchCmsFooter, fetchSearchConfig } from '../services/cms/cms-content';
import {
  fetchMaintenanceNotificationsActual,
  QueryParamsMaintenanceNotifications,
} from '../services/cms/cms-maintenance-notifications';
import { db } from '../services/db/db';

export const router = express.Router();

/**
 * Serves the maintenance and outage notifications.
 */
router.get(
  BffEndpoints.CMS_MAINTENANCE_NOTIFICATIONS,
  async (req, res, next) => {
    try {
      const response = await fetchMaintenanceNotificationsActual(
        queryParams<QueryParamsMaintenanceNotifications>(req)
      );
      return res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * This endpoint serves the Footer content (html in json).
 */
router.get(
  BffEndpoints.CMS_FOOTER,
  async (req: RequestWithQueryParams<{ renewCache?: 'true' }>, res, next) => {
    try {
      const response = await fetchCmsFooter(req.query.renewCache === 'true');
      return res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  BffEndpoints.SEARCH_CONFIG,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await fetchSearchConfig();
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
      } = await loadClusterDatasets(req.body);

      const {
        features: polylines,
        errors: polylineErrors,
        filters: polylineFilters,
      } = await loadPolylineFeatures(req.body);

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
        response = await loadFeatureDetail(datasetId, id);
      } else if (
        datasetCategoryId &&
        datasetId &&
        DATASETS?.[datasetCategoryId].datasets?.[datasetId]
      ) {
        const [[, datasetConfig]] = getDatasetEndpointConfig([datasetId]);
        response = await fetchDataset(
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
  const loginRouteWithReturnTo = `${loginRoute}${getZaakStatusQueryParams(params)}&returnTo=${ZAAK_STATUS_ROUTE}`;
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

// DO NOT MERGE!!
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
router.get('/long/:ms', async (req: Request, res: Response) => {
  const ms = parseInt(req.params.ms, 10);

  if (isNaN(ms) || ms < 0) {
    return res.status(HttpStatusCode.BadRequest).send('Invalid delay time');
  }

  await delay(ms);
  res.send(`Waited ${ms}ms`);
});
router.get('/cookie/clear', async (req: Request, res: Response) => {
  const { queryGET } = await db();
  const ses = await queryGET(
    `SELECT * FROM ${OIDC_SESSIONS_TABLE_NAME} LIMIT 1`
  );
  await destroySession(req, res);
  res.status(HttpStatusCode.Ok).send(ses);
});
router.all(
  BffEndpoints.TELEMETRY_PROXY,
  // We exclude this long running endpoint from updating the rolling OIDC_SESSION_COOKIE_NAME cookie,
  // because this can cause a race condition, setting the cookie after the logout clears it.
  (_req, res, next) => {
    const setCookie = res.getHeader('Set-Cookie');
    res.setHeader('x-debug-cookie-middle', JSON.stringify(setCookie));
    if (!setCookie || typeof setCookie === 'number') {
      return next();
    }

    // Set-Cookie can be a string for a single value and an array of strings for multiple values
    const originalCookies = Array.isArray(setCookie) ? setCookie : [setCookie];
    const cookies = originalCookies.filter(
      (c) => !c.startsWith(`${OIDC_SESSION_COOKIE_NAME}=`)
    );
    res.setHeader('Set-Cookie', cookies);
    res.setHeader('x-debug-cookie-middle2', JSON.stringify(originalCookies));
    res.setHeader('x-debug-cookie-middle3', JSON.stringify(cookies));
    next();
  },
  proxy('https://westeurope-5.in.applicationinsights.azure.com', {
    memoizeHost: true,
    proxyReqPathResolver(_req) {
      return '/v2/track';
    },
    // We exclude this long running endpoint from updating the rolling OIDC_SESSION_COOKIE_NAME cookie,
    // because this can cause a race condition, setting the cookie after the logout clears it.
    userResHeaderDecorator: UserResHeaderDecorator,
  }),
  (_req, res, next) => {
    const setCookie = res.getHeader('Set-Cookie');
    res.setHeader('x-debug-cookie-after', JSON.stringify(setCookie));
    if (!setCookie || typeof setCookie === 'number') {
      return next();
    }

    // Set-Cookie can be a string for a single value and an array of strings for multiple values
    const originalCookies = Array.isArray(setCookie) ? setCookie : [setCookie];
    const cookies = originalCookies.filter(
      (c) => !c.startsWith(`${OIDC_SESSION_COOKIE_NAME}=`)
    );
    res.setHeader('Set-Cookie', cookies);
    res.setHeader('x-debug-cookie-after2', JSON.stringify(originalCookies));
    res.setHeader('x-debug-cookie-after3', JSON.stringify(cookies));
    next();
  }
);

type UserResHeaderDecoratorType = NonNullable<
  ProxyOptions['userResHeaderDecorator']
>;
function UserResHeaderDecorator(
  ...args: Parameters<UserResHeaderDecoratorType>
): ReturnType<UserResHeaderDecoratorType> {
  const [headers] = args;
  const setCookie = headers['Set-Cookie'];
  if (!setCookie || typeof setCookie === 'number') {
    return {
      ...headers,
      'x-debug-cookie': JSON.stringify(setCookie),
      'x-debug-cookie-type': typeof setCookie,
    };
  }

  const originalSetCookie = Array.isArray(setCookie) ? setCookie : [setCookie];
  const filteredSetCookie = originalSetCookie.filter(
    (c) => !c.startsWith(`${OIDC_SESSION_COOKIE_NAME}=`)
  );

  return {
    ...headers,
    'Set-Cookie': filteredSetCookie,
    'x-debug-cookie': JSON.stringify(originalSetCookie),
  };
}

export const legacyRouter = express.Router();

legacyRouter.get(BffEndpoints.LEGACY_LOGIN_API_LOGIN, (req, res) => {
  return res.redirect(authRoutes.AUTH_LOGIN_DIGID);
});

legacyRouter.get(BffEndpoints.LEGACY_LOGIN_API1_LOGIN, (req, res) => {
  return res.redirect(authRoutes.AUTH_LOGIN_EHERKENNING);
});
