import * as Sentry from '@sentry/node';
import express from 'express';
import { apiSuccessResult } from '../universal/helpers';
import { BffEndpoints, OIDC_SESSION_COOKIE_NAME } from './config';
import {
  decodeOIDCToken,
  getAuth,
  hasSessionCookie,
  sendUnauthorized,
} from './helpers/app';

export const router = express.Router();

// AuthMethod agnostic endpoints
router.get(BffEndpoints.AUTH_CHECK, async (req, res) => {
  if (hasSessionCookie(req)) {
    try {
      const auth = await getAuth(req);
      let redirectUrl = '';
      switch (auth.profile.authMethod) {
        case 'eherkenning':
          redirectUrl = BffEndpoints.AUTH_CHECK_EHERKENNING;
          break;
        case 'digid':
          redirectUrl = BffEndpoints.AUTH_CHECK_DIGID;
          break;
        case 'yivi':
          redirectUrl = BffEndpoints.AUTH_CHECK_YIVI;
          break;
      }

      return res.redirect(redirectUrl);
    } catch (error) {
      Sentry.captureException(error);
    }
  }

  res.clearCookie(OIDC_SESSION_COOKIE_NAME);
  return sendUnauthorized(res);
});

router.get(BffEndpoints.AUTH_TOKEN_DATA, async (req, res) => {
  if (hasSessionCookie(req)) {
    try {
      const auth = await getAuth(req);
      return res.send(
        apiSuccessResult({
          tokenData: await decodeOIDCToken(auth.token),
          profile: auth.profile,
        })
      );
    } catch (error) {
      Sentry.captureException(error);
    }
  }

  return sendUnauthorized(res);
});
