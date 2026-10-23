import { differenceInSeconds } from 'date-fns';
import type { Request } from 'express';
import type { AccessToken } from 'express-openid-connect';

import { IS_AP } from '../../universal/config/env.ts';
import {
  OIDC_SESSION_COOKIE_NAME,
  OIDC_SESSION_MAX_AGE_SECONDS,
  TOKEN_ID_ATTRIBUTE,
} from '../auth/auth-config.ts';
import { signDevelopmentToken } from '../auth/auth-helpers-development.ts';
import { getAuth } from '../auth/auth-helpers.ts';
import type { AuthProfile, MaSession } from '../auth/auth-types.ts';
import { ONE_SECOND_MS } from '../config/app.ts';

function parseDevelopmentSessionCookie(sessionCookieValue: string) {
  try {
    return JSON.parse(
      Buffer.from(sessionCookieValue, 'base64').toString('ascii')
    ) as AuthProfile;
  } catch {
    // Ignore parsing errors; this cookie format only exists in local development.
  }
  return null;
}

export async function ensureOIDCAuthContextStub(req: Request) {
  if (IS_AP) {
    return;
  }

  if (getAuth(req)) {
    return;
  }

  const sessionCookieValue = req.cookies?.[OIDC_SESSION_COOKIE_NAME] ?? null;
  if (!sessionCookieValue) {
    return;
  }

  const authProfile = parseDevelopmentSessionCookie(sessionCookieValue);
  if (!authProfile) {
    return;
  }

  await createOIDCStub(req, authProfile);
}

export async function createOIDCStub(
  req: Request,
  authProfile: AuthProfile,
  expiresInSeconds: number = OIDC_SESSION_MAX_AGE_SECONDS
) {
  const idAttr = TOKEN_ID_ATTRIBUTE[authProfile.authMethod];

  // 15 minutes In seconds
  const expiresAt = Date.now() + expiresInSeconds * ONE_SECOND_MS;

  const maSession: MaSession = {
    ...authProfile,
    TMASessionID: 'xx-tma-sid-xx',
    id_token: '',
    access_token: '',
    refresh_token: '',
    token_type: '',
    expires_at: '',
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (req as any)[OIDC_SESSION_COOKIE_NAME] = maSession;

  req.oidc = {
    isAuthenticated() {
      return true;
    },
    async fetchUserInfo() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return {} as any; // UserInfoResponse;
    },
    user: {
      [idAttr]: authProfile.id,
      sid: authProfile.sid,
    },
    accessToken: {
      access_token: await signDevelopmentToken(
        authProfile.authMethod,
        authProfile.id,
        'xx-tma-sid-xx'
      ),
      get expires_in() {
        return differenceInSeconds(new Date(expiresAt), new Date());
      },
      isExpired() {
        return this.expires_in <= 0;
      },
    } as AccessToken,
  };
}
