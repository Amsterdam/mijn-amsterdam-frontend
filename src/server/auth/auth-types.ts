import type { Request } from 'express';
import type { Session } from 'express-openid-connect';

interface AuthProfileBase {
  id: string; // User id (bsn/kvknr)
  sid: SessionID;
}

export interface AuthProfileEHerkenning extends AuthProfileBase {
  authMethod: 'eherkenning';
  profileType: 'commercial';
  vestigingsnummer?: string;
}

export interface AuthProfileDigiD extends AuthProfileBase {
  authMethod: 'digid';
  profileType: Exclude<ProfileType, 'commercial'>;
  vestigingsnummer?: never;
}

export type AuthProfile = AuthProfileEHerkenning | AuthProfileDigiD;

export interface MaSession extends Session {
  sid: SessionID;
  TMASessionID: string; // TMA Session ID
  profileType: ProfileType;
  authMethod: AuthMethod;
}

export interface AuthProfileAndToken {
  token: string;
  profile: AuthProfile;
  expiresAtMilliseconds: number;
}

export interface TokenData {
  sub: string;
  aud: string;
  sid: string;
  id: string;
  [key: string]: unknown;
}

export interface AuthenticatedRequest extends Request {
  // [OIDC_SESSION_COOKIE_NAME]?: MaSession;
  '__MA-appSession'?: MaSession;
}
