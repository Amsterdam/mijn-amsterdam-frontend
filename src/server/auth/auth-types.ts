import { Request } from 'express';
import { Session } from 'express-openid-connect';

import { OIDC_SESSION_COOKIE_NAME } from './auth-config';

export interface AuthProfile {
  authMethod: 'eherkenning' | 'digid';
  profileType: ProfileType;
  id: string; // User id (bsn/kvknr)
  sid: SessionID;
}

export interface MaSession extends Omit<Session, 'expires_at'> {
  sid: SessionID;
  TMASessionID: string; // TMA Session ID
  profileType: ProfileType;
  authMethod: AuthMethod;
  expires_at: number;
}

export interface AuthProfileAndToken {
  token: string;
  profile: AuthProfile;
}

export interface TokenData {
  sub: string;
  aud: string;
  sid: string;
  id: string;
  [key: string]: unknown;
}

export interface AuthenticatedRequest extends Request {
  [OIDC_SESSION_COOKIE_NAME]?: MaSession;
}
