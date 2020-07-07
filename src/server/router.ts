import express, { NextFunction, Request, Response } from 'express';
import { BFF_MS_API_BASE_URL } from './config';
import { getSamlTokenHeader, requestData } from './helpers/request';
import {
  loadServicesCMSContent,
  loadServicesDirect,
  loadServicesGenerated,
  loadServicesMap,
  loadServicesRaw,
  loadServicesRelated,
  loadServicesTips,
} from './services';
import { loadServicesSSE } from './services/services-sse';
import { loadServicesAfval } from './services/services-afval';
import { getSettledResult } from '../universal/helpers/api';

export const router = express.Router();

router.get(`/services/generated`, async function handleRouteServicesGenerated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    res.send(
      await loadServicesGenerated(
        req.sessionID!,
        getSamlTokenHeader(req),
        req.query.optin === '1'
      )
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

router.get(`/services/rawsource`, async function handleRouteServicesRelated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    res.json(await loadServicesRaw(req.sessionID!, getSamlTokenHeader(req)));
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
    res.json(
      await loadServicesTips(
        req.sessionID!,
        getSamlTokenHeader(req),
        req.query.optin === 'true'
      )
    );
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
    const servicesResult = await Promise.all([
      loadServicesCMSContent(req.sessionID!, getSamlTokenHeader(req)),
      loadServicesDirect(req.sessionID!, getSamlTokenHeader(req)),
      loadServicesRelated(req.sessionID!, getSamlTokenHeader(req)),
      loadServicesMap(req.sessionID!, getSamlTokenHeader(req)),
      loadServicesAfval(req.sessionID!, getSamlTokenHeader(req)),
      loadServicesGenerated(
        req.sessionID!,
        getSamlTokenHeader(req),
        req.cookies.optInPersonalizedTips === 'yes'
      ),
    ]);

    res.json(
      servicesResult.reduce((acc, result) => Object.assign(acc, result), {})
    );

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
