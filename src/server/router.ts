import express, { NextFunction, Request, Response } from 'express';
import { getSamlTokenHeader } from './helpers/request';
import {
  loadServicesDirect,
  loadServicesGenerated,
  loadServicesRelated,
  loadServicesTips,
  loadServicesCMSContent,
  loadServicesRaw,
  loadServicesMap,
} from './services';
import { loadServicesSSE } from './services/services-sse';

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

router.get(
  `/status/health`,
  (req: Request, res: Response, next: NextFunction) => {
    res.send('OK');
    next();
  }
);
