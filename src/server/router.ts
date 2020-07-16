import express, { NextFunction, Request, Response } from 'express';
import { BRPData } from '../universal/types';
import { BFF_MS_API_BASE_URL, getApiConfig } from './config';
import { getSamlTokenHeader, requestData } from './helpers/request';
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

export const router = express.Router();

router.get(`/auth/check`, async function authCheck(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const options = getApiConfig('AUTH');

  let responseData = await requestData<BRPData>(
    options,
    req.sessionID!,
    getSamlTokenHeader(req)
  );

  const r1 = responseData;

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
        getSamlTokenHeader(req)
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

router.get(`/services/generated`, async function handleRouteServicesGenerated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    res.send(
      await loadServicesGenerated(req.sessionID!, getSamlTokenHeader(req))
    );
    next();
  } catch (error) {
    next(error);
  }
});

router.get(`/services/related`, async function handleRouteServicesRelated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    res.send(
      await loadServicesRelated(req.sessionID!, getSamlTokenHeader(req))
    );
    next();
  } catch (error) {
    next(error);
  }
});

router.get(`/services/cmscontent`, async function handleRouteServicesRelated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    res.send(
      await loadServicesCMSContent(req.sessionID!, getSamlTokenHeader(req))
    );
    next();
  } catch (error) {
    next(error);
  }
});

router.get(`/services/direct`, async function handleRouteServicesDirect(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    res.json(await loadServicesDirect(req.sessionID!, getSamlTokenHeader(req)));
    next();
  } catch (error) {
    next(error);
  }
});

router.get(`/services/map`, async function handleRouteServicesMap(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    res.json(await loadServicesMap(req.sessionID!, getSamlTokenHeader(req)));
    next();
  } catch (error) {
    next(error);
  }
});

router.get(`/services/tips`, async function handleRouteTips(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const optin = req.query.optin === 'true';
    const data = await loadServicesAll(
      req.sessionID!,
      getSamlTokenHeader(req),
      optin
    );
    res.json(data.TIPS);
    next();
  } catch (error) {
    next(error);
  }
});

router.get(`/services/all`, async function handleRouteServicesMap(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const optin = req.cookies.optInPersonalizedTips === 'yes';
    const servicesResult = await loadServicesAll(
      req.sessionID!,
      getSamlTokenHeader(req),
      optin
    );

    res.json(servicesResult);

    next();
  } catch (error) {
    next(error);
  }
});

router.get(`/services/stream`, loadServicesSSE);

router.get(`/source-api`, async function(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.query.path) {
    next();
  }

  try {
    const responseData = await requestData(
      {
        url: BFF_MS_API_BASE_URL + req.query.path,
      },
      req.sessionID!,
      getSamlTokenHeader(req)
    );
    res.json(responseData);
  } catch (e) {}
  next();
});

router.get(
  `/status/health`,
  (req: Request, res: Response, next: NextFunction) => {
    res.json({ status: 'OK' });
    next();
  }
);
