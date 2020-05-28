import * as Sentry from '@sentry/node';
import axios, { AxiosRequestConfig } from 'axios';
import express, { NextFunction, Request, Response } from 'express';
import { getOtapEnvItem } from '../universal/config';
import { getSamlTokenHeader } from './helpers/request';
import {
  fetchFOCUSTozo,
  fetchTIPS,
  loadServicesDirect,
  loadServicesGenerated,
  loadServicesRelated,
  fetchFOCUSRaw,
} from './services';
import { loadServicesMap } from './services/services-map';
import { loadServicesSSE } from './services/services-sse';
import { fetchFOCUSCombined } from './services/focus/focus-combined';

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
  `/services/direct/focus/raw`,
  async function handleRouteServicesDirect(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const [aanvragen, combined] = await Promise.all([
        fetchFOCUSRaw(req.sessionID!, getSamlTokenHeader(req)),
        fetchFOCUSCombined(req.sessionID!, getSamlTokenHeader(req)),
      ]);
      res.send({
        aanvragen,
        combined,
      });
    } catch (error) {
      if (getOtapEnvItem('sentryDsn')) {
        Sentry.captureException(error);
      }
    }
    next();
  }
);

router.get(
  `/services/direct/focus/tozo`,
  async function handleRouteServicesDirect(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    res.json(await fetchFOCUSTozo(req.sessionID!, getSamlTokenHeader(req)));
    next();
  }
);

router.get(`/services/direct`, async function handleRouteServicesDirect(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.json(await loadServicesDirect(req.sessionID!, getSamlTokenHeader(req)));
  next();
});

router.get(`/services/map`, async function handleRouteServicesMap(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.json(await loadServicesMap(req.sessionID!, getSamlTokenHeader(req)));
  next();
});

router.post(`/services/tips`, async function handleRouteTips(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.json(await fetchTIPS(req.sessionID!, getSamlTokenHeader(req), req.body));
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
  res.json(data);
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
