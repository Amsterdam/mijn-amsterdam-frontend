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
import { getSamlTokenHeader, axiosRequest } from './helpers/request';

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

router.get('/routing', async (req: Request, res: Response) => {
  const r0 = await axiosRequest({ url: 'http://example.org/' });
  console.log('\n', '----'.repeat(20), '\n\n', r0.data);
  const r1 = await axiosRequest({ url: 'https://mijn.acc.amsterdam.nl' });
  console.log('\n', '----'.repeat(20), '\n\n', r1.data);
  // const headerNames = ['']
  // const headers = {

  // }
  const r2 = await axiosRequest({
    url: 'https://mijn.acc.amsterdam.nl/api/focus/aanvragen',
    headers: req.rawHeaders,
  });
  console.log('\n', '----'.repeat(20), '\n\n', req.rawHeaders, '\n\n', r2.data);
  res.send('end');
});
