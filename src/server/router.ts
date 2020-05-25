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

export const router = express.Router();

router.get(`/services/generated`, async function handleRouteServicesGenerated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.send(
    await loadServicesGenerated(req.sessionID!, req.query.optin === '1')
  );
  next();
});

router.get(`/services/related`, async function handleRouteServicesRelated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.send(await loadServicesRelated(req.sessionID!));
  next();
});

router.get(
  `/services/direct/focus/tozo`,
  async function handleRouteServicesDirect(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    res.send(await fetchFOCUSTozo(req.sessionID!));
    next();
  }
);

router.get(`/services/direct`, async function handleRouteServicesDirect(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.send(await loadServicesDirect(req.sessionID!));
  next();
});

router.get(`/services/map`, async function handleRouteServicesMap(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.send(await loadServicesMap(req.sessionID!));
  next();
});

router.post(`/services/tips`, async function handleRouteTips(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.send(await fetchTIPS(req.sessionID!, req.body));
  next();
});

router.get(`/services/all`, async function handleRouteServicesMap(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const data = {
    ...(await loadServicesDirect(req.sessionID!)),
    ...(await loadServicesRelated(req.sessionID!)),
    ...(await loadServicesMap(req.sessionID!)),
    ...(await loadServicesGenerated(
      req.sessionID!,
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
