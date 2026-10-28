import type { Request, RequestHandler, Response } from 'express';
import { decodeJwt } from 'jose';

import { IS_AP } from '../../universal/config/env.ts';
import {
  OIDC_SESSION_COOKIE_NAME,
  oidcSessionStore,
  oidcConfigDigid,
  openIdAuth,
} from '../auth/auth-config.ts';
import { signDevelopmentToken } from '../auth/auth-helpers-development.ts';
import type { AuthProfile } from '../auth/auth-types.ts';

let oidcAuthHandler: RequestHandler | undefined;

export async function ensureOIDCAuthContext(req: Request, res: Response) {
  if (Object.hasOwn(req, OIDC_SESSION_COOKIE_NAME)) {
    return;
  }
  oidcAuthHandler ??= openIdAuth({
    ...oidcConfigDigid,
    session: {
      ...oidcConfigDigid.session,
      store: oidcSessionStore,
    },
  });
  await new Promise<void>((resolve, reject) => {
    oidcAuthHandler!(req, res, (error?: unknown) =>
      error ? reject(error) : resolve()
    );
  });
}

function extractExpiresAtFromToken(token: string) {
  const { exp: expiresAt } = decodeJwt(token);
  if (typeof expiresAt !== 'number') {
    throw new Error('Development token is missing its expiry');
  }
  return expiresAt;
}

export async function createDevelopmentSessionData(profile: AuthProfile) {
  if (IS_AP) {
    throw new Error(
      'Development sessions are not available in this environment'
    );
  }
  const token = await signDevelopmentToken(
    profile.authMethod,
    profile.id,
    'xx-tma-sid-xx'
  );
  if (!token) {
    throw new Error('Failed to create development token');
  }
  return {
    ...profile,
    TMASessionID: 'xx-tma-sid-xx',
    id_token: token,
    access_token: token,
    token_type: 'Bearer',
    expires_at: extractExpiresAtFromToken(token),
  };
}

export async function createOIDCStub(
  req: Request,
  authProfile: AuthProfile,
  expiresInSeconds: number = OIDC_SESSION_MAX_AGE_SECONDS
) {
  if (IS_AP) {
    return;
  }

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
