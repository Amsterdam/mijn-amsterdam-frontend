import express, { Request, Response } from 'express';
import { API_BASE_URL, BFF_API_BASE_URL } from '../universal/config';
import {
  loadServicesGenerated,
  loadServicesDirect,
  loadServicesRelated,
} from './services';
import { loadServicesMap } from './services/services-map';

export const router = express.Router();

router.use(`${API_BASE_URL}/auth/check`, function handleAuthentication(
  req: Request,
  res: Response
) {
  const xSession =
    req.headers['x-session'] && JSON.parse(req.headers['x-session'] as string);

  const { userType, isAuthenticated, validUntil } = xSession || {
    userType: 'BURGER',
    validUntil: -1,
    isAuthenticated: false,
  };

  const response = {
    isAuthenticated,
    validUntil,
    userType,
  };

  return res.send(response);
});

router.use(
  `${BFF_API_BASE_URL}/services/generated`,
  async function handleRouteServicesGenerated(req: Request, res: Response) {
    return res.send(
      await loadServicesGenerated(req.sessionID!, req.query.optin === '1')
    );
  }
);

router.use(
  `${BFF_API_BASE_URL}/services/related`,
  async function handleRouteServicesRelated(req: Request, res: Response) {
    return res.send(await loadServicesRelated(req.sessionID!));
  }
);

router.use(
  `${BFF_API_BASE_URL}/services/direct`,
  async function handleRouteServicesDirect(req: Request, res: Response) {
    return res.send(await loadServicesDirect(req.sessionID!));
  }
);

router.use(
  `${BFF_API_BASE_URL}/services/map`,
  async function handleRouteServicesMap(req: Request, res: Response) {
    return res.send(await loadServicesMap(req.sessionID!));
  }
);
