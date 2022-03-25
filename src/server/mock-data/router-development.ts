import express, {
  CookieOptions,
  NextFunction,
  Request,
  Response,
} from 'express';
import path from 'path';
import { apiSuccessResult } from '../../universal/helpers/api';
import {
  OIDC_SESSION_COOKIE_NAME,
  OIDC_SESSION_MAX_AGE_SECONDS,
} from '../config';
import { generateDevSessionCookieValue } from '../helpers/app';
import VergunningenDocuments from './json/vergunningen-documenten.json';

export const authRouterDevelopment = express.Router();

authRouterDevelopment.get(
  '/bff/dev/auth/:authMethod/login',
  (req: Request, res: Response, next: NextFunction) => {
    const appSessionCookieOptions: CookieOptions = {
      expires: new Date(
        new Date().getTime() + OIDC_SESSION_MAX_AGE_SECONDS * 1000
      ),
      httpOnly: true,
      path: '/',
      secure: false, // Not secure for local development
      sameSite: 'lax',
    };
    let appSessionCookieValue = '';

    switch (req.params.authMethod) {
      case 'eherkenning':
        appSessionCookieValue = generateDevSessionCookieValue({
          sub: '123KVK456',
          aud: process.env.BFF_OIDC_CLIENT_ID_EHERKENNING || '',
        });
        break;
      default:
      case 'digid':
        appSessionCookieValue = generateDevSessionCookieValue({
          sub: '321BSN987',
          aud: process.env.BFF_OIDC_CLIENT_ID_DIGID || '',
        });
        break;
    }

    res.cookie(
      OIDC_SESSION_COOKIE_NAME,
      appSessionCookieValue,
      appSessionCookieOptions
    );

    return res.redirect(`${process.env.BFF_FRONTEND_URL}`);
  }
);

authRouterDevelopment.get('/bff/dev/auth/logout', (req, res) => {
  res.clearCookie(OIDC_SESSION_COOKIE_NAME);
  return res.redirect(`${process.env.BFF_FRONTEND_URL}`);
});

export const routerDevelopment = express.Router();

routerDevelopment.get(
  '/decosjoin/listdocuments/:key',
  (req: Request, res: Response, next: NextFunction) => {
    let response = VergunningenDocuments;
    if (req.path.endsWith('no-documents')) {
      response = { content: [], status: 'OK' };
    }
    res.json(response).end();
  }
);

routerDevelopment.get(
  '/wpi/document',
  (req: Request, res: Response, next: NextFunction) => {
    res.type('application/pdf');
    res.sendFile(path.join(__dirname, 'document.pdf'));
    // res.end();
  }
);

routerDevelopment.get(
  '/wpi/stadspas/transacties/:id',
  (req: Request, res: Response, next: NextFunction) => {
    res
      .json(
        apiSuccessResult([
          {
            id: 'xx1',
            title: 'Hema',
            amount: -31.3,
            date: '2020-01-04',
          },
          {
            id: 'xx2',
            title: 'Aktiesport',
            amount: 21.3,
            date: '2019-12-16',
          },
          {
            id: 'xx3',
            title: 'Hema',
            amount: -0.99,
            date: '2019-10-21',
          },
        ])
      )
      .end();
  }
);

routerDevelopment.post(
  '/brp/aantal_bewoners',
  (req: Request, res: Response, next: NextFunction) => {
    res.json({ residentCount: 3 }).end();
  }
);
