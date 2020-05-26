import express, { Request, Response, NextFunction } from 'express';
import {
  loadServicesGenerated,
  loadServicesDirect,
  loadServicesRelated,
  fetchTIPS,
  fetchFOCUSTozo,
} from './services';
import { loadServicesMap } from './services/services-map';
import { loadServicesSSE } from './services/services-sse';
import { getSamlTokenHeader } from './helpers/request';
import * as Sentry from '@sentry/node';
import { getOtapEnvItem } from '../universal/config';
import { networkInterfaces } from 'os';
import axios, { AxiosRequestConfig } from 'axios';

export const router = express.Router();

router.get(`/services/generated`, async function handleRouteServicesGenerated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.send(
    await loadServicesGenerated(
      req.sessionID!,
      getSamlTokenHeader(req),
      req.query.optin === '1'
    )
  );
  next();
});

router.get(`/services/related`, async function handleRouteServicesRelated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.send(await loadServicesRelated(req.sessionID!, getSamlTokenHeader(req)));
  next();
});

router.get(
  `/services/direct/focus/tozo`,
  async function handleRouteServicesDirect(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    res.send(await fetchFOCUSTozo(req.sessionID!, getSamlTokenHeader(req)));
    next();
  }
);

router.get(`/services/direct`, async function handleRouteServicesDirect(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.send(await loadServicesDirect(req.sessionID!, getSamlTokenHeader(req)));
  next();
});

router.get(`/services/map`, async function handleRouteServicesMap(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.send(await loadServicesMap(req.sessionID!, getSamlTokenHeader(req)));
  next();
});

router.post(`/services/tips`, async function handleRouteTips(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.send(await fetchTIPS(req.sessionID!, getSamlTokenHeader(req), req.body));
  next();
});

router.get(`/services/all`, async function handleRouteServicesMap(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const data = {
    ...(await loadServicesDirect(req.sessionID!, getSamlTokenHeader(req))),
    ...(await loadServicesRelated(req.sessionID!, getSamlTokenHeader(req))),
    ...(await loadServicesMap(req.sessionID!, getSamlTokenHeader(req))),
    ...(await loadServicesGenerated(
      req.sessionID!,
      getSamlTokenHeader(req),
      req.cookies.optInPersonalizedTips === 'yes'
    )),
  };
  res.send(data);
  next();
});

router.get(`/services/stream`, loadServicesSSE);

router.get(
  `/status/health`,
  (req: Request, res: Response, next: NextFunction) => {
    res.send('OK');
    next();
  }
);

router.get('/netw', async (req: Request, res: Response) => {
  try {
    const interfaces = networkInterfaces();
    console.log(interfaces);
    if (getOtapEnvItem('sentryDsn')) {
      Sentry.captureMessage('End of netw request');
    }
  } catch (e) {
    Sentry.captureException(e);
  }
  res.send('foo:bar!');
});

router.get('/log-url', async (req: Request, res: Response) => {
  const withHeaders = !!req.query.withHeaders;
  const url = (req.query.url || 'http://example.org') as string;
  let response = 'checked';
  try {
    const cfg: AxiosRequestConfig = {
      url,
      timeout: 2000,
    };
    if (withHeaders) {
      cfg.headers = req.rawHeaders;
    }
    console.log(cfg);
    const r0 = await axios(cfg);
    response = r0.data;
  } catch (e) {
    response = e;
    console.log(e);
    if (getOtapEnvItem('sentryDsn')) {
      Sentry.captureException(e);
    }
  }
  return res.send(response + 'fin');
});
