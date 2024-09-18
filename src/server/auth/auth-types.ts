export interface AuthProfile {
  authMethod: 'eherkenning' | 'digid';
  profileType: ProfileType;
  id: string; // User id (bsn/kvknr)
  sid: SessionID;
}

export interface SessionData {
  access_token: string;
  id_token: string;
  token_type: string;
  expires_at: string;
  client_id: string;
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
