import express, { NextFunction, Request, Response } from 'express';
import { BffEndpoints } from './config';
import { getPassthroughRequestHeaders } from './helpers/request';
import {
  loadServicesCMSContent,
  loadServicesDirect,
  loadServicesGenerated,
  loadServicesMap,
  loadServicesRelated,
} from './services';
import { loadServicesAll } from './services/services-all';
import { loadServicesSSE } from './services/services-sse';

export const router = express.Router();

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
