import express, { NextFunction, Request, Response } from 'express';
import { BRPData } from '../universal/types';
import { BFF_MS_API_BASE_URL, getApiConfig, BffEndpoints } from './config';
import { getPassthroughRequestHeaders, requestData } from './helpers/request';
import {
  loadServicesCMSContent,
  loadServicesDirect,
  loadServicesGenerated,
  loadServicesMap,
  loadServicesRelated,
} from './services';
import { loadServicesSSE } from './services/services-sse';
import * as Sentry from '@sentry/node';
import url from 'url';
import { loadServicesAll } from './services/services-all';
import { IS_AP } from '../universal/config/env';

export const router = express.Router();

router.get(BffEndpoints.AUTH_CHECK, async function authCheck(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const options = getApiConfig('AUTH');

  let responseData = await requestData<BRPData>(
    options,
    req.sessionID!,
    getPassthroughRequestHeaders(req)
  );

  const r1 = responseData;

  /**
   * In production set-up we are presented with a html page that redirects us
   * so our eHerkenning session is validated through the Digid route.
   */
  if (typeof responseData.content === 'string') {
    const reg = new RegExp(/top\.location="(.*)"/gi);
    const matches = reg.exec(responseData.content as string);
    const matchedUrl = matches && matches[1];
    console.info('matches', matches);
    if (matchedUrl) {
      const reqUrl = new url.URL(matchedUrl);
      console.info(
        'reqUrl.origin + reqUrl.pathname',
        reqUrl.origin + reqUrl.pathname,
        reqUrl.searchParams
      );
      responseData = await requestData<BRPData>(
        Object.assign({}, options, {
          url: reqUrl.origin + reqUrl.pathname,
          params: reqUrl.searchParams,
        }),
        req.sessionID!,
        getPassthroughRequestHeaders(req)
      );
    }
  }

  Sentry.captureMessage('auth/check', {
    extra: {
      contentType1: typeof r1.content,
      contentType2: typeof responseData.content,
    },
  });

  res.json(responseData.content);
  next();
});

router.get(
  BffEndpoints.SERVICES_GENERATED,
  async function handleRouteServicesGenerated(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      res.send(
        await loadServicesGenerated(
          req.sessionID!,
          getPassthroughRequestHeaders(req)
        )
      );
      next();
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  BffEndpoints.SERVICES_RELATED,
  async function handleRouteServicesRelated(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      res.send(
        await loadServicesRelated(
          req.sessionID!,
          getPassthroughRequestHeaders(req)
        )
      );
      next();
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  BffEndpoints.SERVICES_CMSCONTENT,
  async function handleRouteServicesCMSContent(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      res.send(
        await loadServicesCMSContent(
          req.sessionID!,
          getPassthroughRequestHeaders(req)
        )
      );
      next();
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  BffEndpoints.SERVICES_DIRECT,
  async function handleRouteServicesDirect(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      res.json(
        await loadServicesDirect(
          req.sessionID!,
          getPassthroughRequestHeaders(req)
        )
      );
      next();
    } catch (error) {
      next(error);
    }
  }
);

router.get(BffEndpoints.SERVICES_MAP, async function handleRouteServicesMap(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    res.json(
      await loadServicesMap(req.sessionID!, getPassthroughRequestHeaders(req))
    );
    next();
  } catch (error) {
    next(error);
  }
});

router.get(BffEndpoints.SERVICES_TIPS, async function handleRouteTips(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const optin = req.query.optin === 'true';
    const data = await loadServicesAll(
      req.sessionID!,
      getPassthroughRequestHeaders(req),
      optin
    );
    res.json(data.TIPS);
    next();
  } catch (error) {
    next(error);
  }
});

router.get(BffEndpoints.SERVICES_ALL, async function handleRouteServicesAll(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const optin = req.cookies.optInPersonalizedTips === 'yes';
    const servicesResult = await loadServicesAll(
      req.sessionID!,
      getPassthroughRequestHeaders(req),
      optin
    );

    res.json(servicesResult);

    next();
  } catch (error) {
    next(error);
  }
});

router.get(BffEndpoints.SERVICES_STREAM, loadServicesSSE);

router.get(
  BffEndpoints.HEALTH,
  (req: Request, res: Response, next: NextFunction) => {
    res.json({ status: 'OK' });
    next();
  }
);
