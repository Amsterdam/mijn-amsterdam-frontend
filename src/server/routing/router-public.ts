import type { IncomingHttpHeaders } from 'http';

import axios, { HttpStatusCode, type AxiosResponse } from 'axios';
import type { NextFunction, Request, Response } from 'express';
import express from 'express';
import proxy from 'express-http-proxy';

import { BffEndpoints } from './bff-routes.ts';
import {
  generateFullApiUrlBFF,
  queryParams,
  type RequestWithQueryParams,
} from './route-helpers.ts';
import { ZAAK_STATUS_ROUTE } from '../../client/pages/ZaakStatus/ZaakStatus-config.ts';
import { IS_PRODUCTION, OTAP_ENV } from '../../universal/config/env.ts';
import {
  DATASETS,
  getDatasetCategoryId,
} from '../../universal/config/myarea-datasets.ts';
import type { ApiResponse_DEPRECATED } from '../../universal/helpers/api.ts';
import { apiSuccessResult } from '../../universal/helpers/api.ts';
import { OIDC_SESSION_COOKIE_NAME } from '../auth/auth-config.ts';
import {
  getAuth,
  getReturnToUrlZaakStatus,
  getZaakStatusQueryParams,
} from '../auth/auth-helpers.ts';
import { authRoutes } from '../auth/auth-routes.ts';
import { RELEASE_VERSION } from '../config/app.ts';
import { getAllFeatureToggles } from '../config/azure-appconfiguration.ts';
import { getFromEnv } from '../helpers/env.ts';
import { getRequestParamsFromQueryString } from '../helpers/source-api-request.ts';
import { logger } from '../logging.ts';
import {
  fetchDataset,
  loadFeatureDetail,
  loadPolylineFeatures,
} from '../services/buurt/buurt.ts';
import { getDatasetEndpointConfig } from '../services/buurt/helpers.ts';
import { loadClusterDatasets } from '../services/buurt/supercluster.ts';
import {
  fetchCmsFooter,
  fetchSearchConfig,
} from '../services/cms/cms-content.ts';
import { fetchActiveMaintenanceNotifications } from '../services/cms/cms-maintenance-notifications.ts';
import type { QueryParamsMaintenanceNotifications } from '../services/cms/cms-types.ts';

export const router = express.Router();

/**
 * Serves the maintenance and outage notifications.
 */
router.get(
  BffEndpoints.CMS_MAINTENANCE_NOTIFICATIONS,
  async (req, res, next) => {
    try {
      const response = await fetchActiveMaintenanceNotifications(
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
  async (
    req: Request<{ datasetId: string; id: string }>,
    res: Response,
    next: NextFunction
  ) => {
    const datasetId = req.params.datasetId;
    const id = req.params.id;
    const datasetCategoryId = getDatasetCategoryId(datasetId);

    let response: ApiResponse_DEPRECATED<unknown> | null = null;

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

router.get(BffEndpoints.FEATURE_TOGGLES, async (_, res) => {
  res.json(getAllFeatureToggles());
});

// /**
//  * Zaak status endpoint redirects to zaakstatus if authenticated, else redirect to login
//  */
router.get(BffEndpoints.ZAAK_STATUS, zaakStatusHandler);

export async function zaakStatusHandler(req: Request, res: Response) {
  const authProfileAndToken = getAuth(req);
  const params = queryParams<{
    id: string;
    thema: string;
    'auth-type': string;
    payment?: 'true';
  }>(req);

  const redirectUrl = getReturnToUrlZaakStatus(params);

  if (authProfileAndToken) {
    return res.redirect(redirectUrl);
  }

  const authType =
    params['auth-type'] === 'eherkenning' ? 'EHERKENNING' : 'DIGID';
  const loginRouteWithReturnTo = generateFullApiUrlBFF(
    authRoutes[`AUTH_LOGIN_${authType}`],
    [
      {
        ...getRequestParamsFromQueryString(getZaakStatusQueryParams(params)),
        returnTo: ZAAK_STATUS_ROUTE,
      },
    ]
  );

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

function stripSetCookieFromResponse(cookieName: string) {
  return (_req: Request, res: Response, next: NextFunction) => {
    const originalSetHeader = res.setHeader.bind(res);

    res.setHeader = (
      name: string,
      value: number | string | readonly string[]
    ) => {
      if (name.toLowerCase() !== 'set-cookie') {
        return originalSetHeader(name, value);
      }
      if (Array.isArray(value)) {
        const filtered = value.filter(
          (cookie: string) => !cookie.startsWith(`${cookieName}=`)
        );
        return originalSetHeader(name, filtered);
      } else if (typeof value === 'string') {
        if (value.startsWith(`${cookieName}=`)) {
          return res;
        }
      }
      return originalSetHeader(name, value);
    };

    next();
  };
}
router.all(
  BffEndpoints.TELEMETRY_PROXY,
  // We exclude this long running endpoint from updating the rolling OIDC_SESSION_COOKIE_NAME cookie,
  // because this can cause a race condition, setting the cookie after the logout clears it.
  stripSetCookieFromResponse(OIDC_SESSION_COOKIE_NAME),
  proxy('https://westeurope-5.in.applicationinsights.azure.com', {
    memoizeHost: true,
    proxyReqPathResolver(_req) {
      return '/v2/track';
    },
  })
);

if (!IS_PRODUCTION) {
  const PROXY_API_KEY = getFromEnv('MA_DEV_API_KEY', false);

  router.all(BffEndpoints.PROXY, async (req, res) => {
    // This proxy route aims to closely mimic the server's behavior, making it appear as though the server itself initiated these requests.
    // All functional headers needed are prefixed with 'x-ma-' to prevent conflicts. These are deleted before the request is sent to it's destination.
    const apiKeyName = 'x-ma-dev-api-key';
    const apiKey = req.headers[apiKeyName];
    if (apiKey !== PROXY_API_KEY) {
      return res
        .status(HttpStatusCode.Unauthorized)
        .send(`Invalid or missing header '${apiKeyName}'`);
    }

    const urlHeaderName = 'x-ma-proxy-url';
    const url = req.headers[urlHeaderName];
    if (!url || typeof url !== 'string') {
      return res
        .status(HttpStatusCode.BadRequest)
        .send(
          `Url to send request to was not found in header: '${urlHeaderName}'`
        );
    }

    axios({
      url,
      method: req.method,
      headers: stripHeadersStartingWith(req.headers, ['x-ma-', 'cookie']),
      data: req.body,
      // Prevent parsing of responses.
      transformResponse: (res) => res,
    })
      .then((incomingResponse) => {
        sendProxyResponse(incomingResponse, res);
      })
      .catch((err) => {
        if (err.response) {
          sendProxyResponse(err.response, res);
        } else if (err.request) {
          res.status(0).send(`Request send to ${url} but no response recieved`);
        } else {
          logger.error(err);
        }
      });
  });
}

function stripHeadersStartingWith(
  headers: IncomingHttpHeaders,
  disallowedHeaders: string[]
): IncomingHttpHeaders {
  const clean = Object.entries(headers).filter(([name]) => {
    for (const disallowedHeader of disallowedHeaders) {
      if (name.startsWith(disallowedHeader)) {
        return false;
      }
    }
    return true;
  });
  return Object.fromEntries(clean);
}

function sendProxyResponse(incoming: AxiosResponse, outgoing: Response): void {
  outgoing
    .setHeaders(new Map(Object.entries(incoming.headers)))
    .status(incoming.status);
}

export const legacyRouter = express.Router();

legacyRouter.get(BffEndpoints.LEGACY_LOGIN_API_LOGIN, (req, res) => {
  return res.redirect(generateFullApiUrlBFF(authRoutes.AUTH_LOGIN_DIGID));
});

legacyRouter.get(BffEndpoints.LEGACY_LOGIN_API1_LOGIN, (req, res) => {
  return res.redirect(generateFullApiUrlBFF(authRoutes.AUTH_LOGIN_EHERKENNING));
});
