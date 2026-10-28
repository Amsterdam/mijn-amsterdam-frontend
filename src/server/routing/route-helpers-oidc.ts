import { promisify } from 'node:util';

import { differenceInSeconds } from 'date-fns';
import type { Request, RequestHandler, Response } from 'express';
import type { AccessToken } from 'express-openid-connect';

import { IS_AP } from '../../universal/config/env.ts';
import {
  OIDC_SESSION_COOKIE_NAME,
  OIDC_SESSION_MAX_AGE_SECONDS,
  OIDC_SESSION_ABSOLUTE_MAX_AGE_SECONDS,
  oidcSessionStore,
  oidcConfigDigid,
  openIdAuth,
  TOKEN_ID_ATTRIBUTE,
} from '../auth/auth-config.ts';
import { signDevelopmentToken } from '../auth/auth-helpers-development.ts';
import { getAuth } from '../auth/auth-helpers.ts';
import type { AuthProfile, MaSession } from '../auth/auth-types.ts';
import { ONE_SECOND_MS } from '../config/app.ts';
import { featureToggle } from '../services/amsapp/auth/amsapp-auth-service-config.ts';

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

export async function createDevelopmentSessionData(profile: AuthProfile) {
  if (IS_AP) {
    throw new Error('Development sessions are only available in local/test');
  }
  const token = await signDevelopmentToken(
    profile.authMethod,
    profile.id,
    'xx-tma-sid-xx'
  );
  return {
    ...profile,
    TMASessionID: 'xx-tma-sid-xx',
    id_token: token,
    access_token: token,
    token_type: 'Bearer',
    expires_at:
      Math.floor(Date.now() / ONE_SECOND_MS) + OIDC_SESSION_MAX_AGE_SECONDS,
  };
}

async function storeDevelopmentSession(
  token: string,
  profile: AuthProfile,
  issuedAt = Math.floor(Date.now() / ONE_SECOND_MS)
) {
  const now = Math.floor(Date.now() / ONE_SECOND_MS);
  const expiresAt = Math.min(
    now + OIDC_SESSION_MAX_AGE_SECONDS,
    issuedAt + OIDC_SESSION_ABSOLUTE_MAX_AGE_SECONDS
  );
  await promisify(oidcSessionStore.set.bind(oidcSessionStore))(token, {
    header: { iat: issuedAt, uat: now, exp: expiresAt },
    data: {
      ...profile,
      TMASessionID: 'xx-tma-sid-xx',
      id_token: '',
      access_token: '',
      refresh_token: '',
      token_type: '',
      expires_at: '',
    },
    cookie: {
      expires: expiresAt * ONE_SECOND_MS,
      maxAge: expiresAt * ONE_SECOND_MS - Date.now(),
    },
  });
  return expiresAt - now;
}

export async function createDevelopmentSession(
  req: Request,
  profile: AuthProfile
) {
  const token = Buffer.from(JSON.stringify(profile)).toString('base64');
  if (featureToggle.amsAppUniversalAuthIsActive) {
    await storeDevelopmentSession(token, profile);
  }
  await createOIDCStub(req, profile);
  return token;
}

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
  if (IS_AP || getAuth(req)) {
    return;
  }

  const sessionCookieValue = req.cookies?.[OIDC_SESSION_COOKIE_NAME] ?? null;
  if (!sessionCookieValue) {
    return;
  }

  if (featureToggle.amsAppUniversalAuthIsActive) {
    const session = await promisify(
      oidcSessionStore.get.bind(oidcSessionStore)
    )(sessionCookieValue);
    const now = Math.floor(Date.now() / ONE_SECOND_MS);
    if (
      !session ||
      session.header.exp <= now ||
      session.header.uat + OIDC_SESSION_MAX_AGE_SECONDS <= now ||
      session.header.iat + OIDC_SESSION_ABSOLUTE_MAX_AGE_SECONDS <= now
    ) {
      return;
    }
    const profile = session.data as MaSession & AuthProfile;
    const expiresInSeconds = await storeDevelopmentSession(
      sessionCookieValue,
      profile,
      session.header.iat
    );
    await createOIDCStub(req, profile, expiresInSeconds);
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
