import express, { NextFunction, Request, Response } from 'express';
import { getSamlTokenHeader } from './helpers/request';
import {
  fetchTIPS,
  loadServicesDirect,
  loadServicesGenerated,
  loadServicesRelated,
} from './services';
import { loadServicesMap } from './services/services-map';
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

router.post(`/services/tips`, async function handleRouteTips(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    res.json(
      await fetchTIPS(req.sessionID!, getSamlTokenHeader(req), req.body)
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
