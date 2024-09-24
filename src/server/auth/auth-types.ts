import { Session } from 'express-openid-connect';

export interface AuthProfile {
  authMethod: 'eherkenning' | 'digid';
  profileType: ProfileType;
  id: string; // User id (bsn/kvknr)
  sid: SessionID;
}

export interface MaSession extends Session {
  sid: SessionID;
  TMASessionID: string; // TMA Session ID
  profileType: ProfileType;
  authMethod: AuthMethod;
}

export interface AuthProfileAndToken {
  token: string;
  profile: AuthProfile;
}

export interface TokenData {
  sub: string;
  aud: string;
  sid: string;
  [key: string]: any;
}
