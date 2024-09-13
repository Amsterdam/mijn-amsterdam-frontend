export interface AuthProfile {
  authMethod: 'eherkenning' | 'digid';
  profileType: ProfileType;
  id: string; // User id (bsn/kvknr)
  sid: string; // TMA Session ID
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
