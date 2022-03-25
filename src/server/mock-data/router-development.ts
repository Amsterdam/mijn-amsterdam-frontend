import express, {
  CookieOptions,
  NextFunction,
  Request,
  Response,
} from 'express';
import jose, { JWE, JWK } from 'jose';
import path from 'path';
import { apiSuccessResult } from '../../universal/helpers/api';
import {
  OIDC_SESSION_COOKIE_NAME,
  OIDC_SESSION_MAX_AGE_SECONDS,
} from '../config';
import VergunningenDocuments from './json/vergunningen-documenten.json';

const { encryption: deriveKey } = require('express-openid-connect/lib/hkdf');

export const routerDevelopment = express.Router();

const secretString = `${process.env.BFF_OIDC_SECRET}`;

interface DevSessionData {
  sub: number | string;
  aud: string;
}

function encrypt(payload: string, headers: object) {
  const alg = 'dir';
  const enc = 'A256GCM';
  const key = JWK.asKey(deriveKey(secretString));
  return JWE.encrypt(payload, key, { alg, enc, ...headers });
}

function calculateExp(iat: number) {
  return iat + OIDC_SESSION_MAX_AGE_SECONDS;
}

function generateDevSessionCookieValue({ sub, aud }: DevSessionData) {
  const uat = (Date.now() / 1000) | 0;
  const iat = uat;
  const exp = calculateExp(iat);
  const idToken = jose.JWT.sign({ sub, aud }, secretString);
  const value = encrypt(JSON.stringify({ id_token: idToken }), {
    iat,
    uat,
    exp,
  });
  return value;
}

routerDevelopment.get(
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

routerDevelopment.get('/bff/dev/auth/logout', (req, res) => {
  res.clearCookie(OIDC_SESSION_COOKIE_NAME);
  return res.redirect(`${process.env.BFF_FRONTEND_URL}`);
});

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
