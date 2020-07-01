import express, { NextFunction, Request, Response } from 'express';
import { BFF_MS_API_BASE_URL } from './config';
import { getSamlTokenHeader, requestData } from './helpers/request';
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

router.get(`/auth/check`, async function authCheck(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const options = getApiConfig('AUTH');
  const responseData = await requestData<BRPData>(
    options,
    req.sessionID!,
    getSamlTokenHeader(req)
  );

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
