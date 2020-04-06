import { API_BASE_URL, BFF_API_BASE_URL } from '../universal/config';
import express, { Request, Response } from 'express';
import { fetchTIPS, loadServicesDirect, loadServicesRelated } from './services';

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
  `${BFF_API_BASE_URL}/services/tips`,
  async function handleRouteServicesTips(req: Request, res: Response) {
    const relatedServicesData = await loadServicesRelated(req.sessionID!);
    const directServicesData = await loadServicesDirect(req.sessionID!);

    const tips = await fetchTIPS({
      optin: !!req.cookies?.optInPersonalizedTips,
      data: {
        ...relatedServicesData,
        ...directServicesData,
      },
    });

    return res.send(tips);
  }
);

router.use(
  `${BFF_API_BASE_URL}/services/related`,
  async function handleRouteServicesRelated(req: Request, res: Response) {
    const { BRP, BAG, AFVAL } = await loadServicesRelated(req.sessionID!);

    return res.send({
      BAG,
      BRP,
      AFVAL,
    });
  }
);

router.use(
  `${BFF_API_BASE_URL}/services/direct`,
  async function handleRouteServicesDirect(req: Request, res: Response) {
    const userDataLoaders = loadServicesDirect(req.sessionID!);

    Promise.all(Object.values(userDataLoaders)).then(
      ([FOCUS, WMO, ERFPACHT, BELASTINGEN, MILIEUZONE]) => {
        res.send({
          FOCUS,
          WMO,
          ERFPACHT,
          BELASTINGEN,
          MILIEUZONE,
        });
      }
    );
  }
);
