import express, { Request, Response, NextFunction } from 'express';
import { BFF_API_BASE_URL } from '../universal/config';
import {
  loadServicesGenerated,
  loadServicesDirect,
  loadServicesRelated,
} from './services';
import { loadServicesMap } from './services/services-map';
import { loadServicesSSE } from './services/services-sse';

export const router = express.Router();

router.use(
  `${BFF_API_BASE_URL}/services/generated`,
  async function handleRouteServicesGenerated(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    res.send(
      await loadServicesGenerated(req.sessionID!, req.query.optin === '1')
    );
    next();
  }
);

router.use(
  `${BFF_API_BASE_URL}/services/related`,
  async function handleRouteServicesRelated(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    res.send(await loadServicesRelated(req.sessionID!));
    next();
  }
);

router.use(
  `${BFF_API_BASE_URL}/services/direct`,
  async function handleRouteServicesDirect(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    res.send(await loadServicesDirect(req.sessionID!));
    next();
  }
);

router.use(
  `${BFF_API_BASE_URL}/services/map`,
  async function handleRouteServicesMap(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    res.send(await loadServicesMap(req.sessionID!));
    next();
  }
);

router.use(
  `${BFF_API_BASE_URL}/services/all`,
  async function handleRouteServicesMap(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const data = {
      ...(await loadServicesDirect(req.sessionID!)),
      ...(await loadServicesRelated(req.sessionID!)),
      ...(await loadServicesMap(req.sessionID!)),
      ...(await loadServicesGenerated(req.sessionID!, req.query.optin === '1')),
    };
    res.send(data);
    next();
  }
);

router.use(`${BFF_API_BASE_URL}/services/stream`, loadServicesSSE);
