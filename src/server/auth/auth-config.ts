import { auth, ConfigParams } from 'express-openid-connect';
import expressSession from 'express-session';
import UID from 'uid-safe';

import { BFF_OIDC_BASE_URL, BFF_OIDC_ISSUER_BASE_URL } from './auth-routes';
import { getSessionStore } from './auth-session-store';
import { TokenData } from './auth-types';
import { FeatureToggle } from '../../universal/config/feature-toggles';
import { ONE_HOUR_MS, ONE_MINUTE_SECONDS } from '../config/app';
import { getFromEnv } from '../helpers/env';

// Amsterdam App return to url config
export const RETURNTO_AMSAPP_STADSPAS_ADMINISTRATIENUMMER =
  'amsapp-stadspas-administratienummer';
export const RETURNTO_AMSAPP_STADSPAS_APP_LANDING = 'amsapp-stadspas-landing';

// Mijn Amsterdam return to url config
export const RETURNTO_MAMS_LANDING_DIGID = 'mams-landing-digid';
export const RETURNTO_MAMS_LANDING_EHERKENNING = 'mams-landing-eherkenning';

// eslint-disable-next-line no-magic-numbers
export const OIDC_SESSION_MAX_AGE_SECONDS = ONE_MINUTE_SECONDS * 15; // 15 minutes
export const OIDC_SESSION_COOKIE_NAME = '__MA-appSession';
export const OIDC_COOKIE_ENCRYPTION_KEY = `${getFromEnv('BFF_GENERAL_ENCRYPTION_KEY')}`;
export const OIDC_ID_TOKEN_EXP = '1 hours'; // Arbitrary, MA wants a token to be valid for a maximum of 1 hours.
export const OIDC_IS_TOKEN_EXP_VERIFICATION_ENABLED = true;

// eslint-disable-next-line no-magic-numbers
export const OIDC_TOKEN_EXP = ONE_HOUR_MS * 3; // The TMA currently has a token expiration time of 3 hours

export const openIdAuth = auth;

export const OIDC_SESSIONS_TABLE_NAME = 'oidcsessions';

export const oidcConfigBase: ConfigParams = {
  authRequired: false,
  auth0Logout: false,
  // Tries to logout at the IDP's end_session endpoint.
  idpLogout: true,
  // Cookie encryption
  secret: OIDC_COOKIE_ENCRYPTION_KEY,
  // Client secret
  clientSecret: getFromEnv('BFF_OIDC_SECRET', true),
  clientID: 'x', // Set in configs for digid and eherkenning, required by ConfigParams type.
  baseURL: BFF_OIDC_BASE_URL,
  issuerBaseURL: BFF_OIDC_ISSUER_BASE_URL,
  attemptSilentLogin: false,
  authorizationParams: { prompt: 'login', response_type: 'code' },
  clockTolerance: 120, // 2 minutes
  session: {
    rolling: true,
    rollingDuration: OIDC_SESSION_MAX_AGE_SECONDS,
    name: OIDC_SESSION_COOKIE_NAME,
    store:
      getFromEnv('MA_APP_MODE') !== 'unittest'
        ? getSessionStore(openIdAuth as typeof expressSession, {
            tableName: OIDC_SESSIONS_TABLE_NAME,
            maxAgeSeconds: OIDC_SESSION_MAX_AGE_SECONDS,
          })
        : undefined,
  },
  routes: {
    login: false,
    logout: false,
    callback: false,
  },
  httpTimeout: 10000,
};

const BYTE_LENGTH = 8;
export const oidcConfigDigid: ConfigParams = {
  ...oidcConfigBase,
  clientID: getFromEnv('BFF_OIDC_CLIENT_ID_DIGID', true),
  afterCallback: async (_, __, session) => {
    return {
      ...session,
      TMASessionID: session.sid,
      sid: UID.sync(BYTE_LENGTH),
      profileType: 'private',
      authMethod: 'digid',
    };
  },
};

export const oidcConfigEherkenning: ConfigParams = {
  ...oidcConfigBase,
  clientID: getFromEnv('BFF_OIDC_CLIENT_ID_EHERKENNING', true),
  afterCallback: async (req, res, session) => {
    return {
      ...session,
      TMASessionID: session.sid,
      sid: UID.sync(BYTE_LENGTH),
      profileType: 'commercial',
      authMethod: 'eherkenning',
    };
  },
};

// Op 1.13 met ketenmachtiging
export const EH_ATTR_INTERMEDIATE_PRIMARY_ID =
  'urn:etoegang:core:LegalSubjectID';
export const EH_ATTR_INTERMEDIATE_SECONDARY_ID =
  'urn:etoegang:1.9:IntermediateEntityID:KvKnr';

// 1.13 inlog zonder ketenmachtiging:
export const EH_ATTR_PRIMARY_ID = 'urn:etoegang:core:LegalSubjectID';

// < 1.13 id
export const EH_ATTR_PRIMARY_ID_LEGACY =
  'urn:etoegang:1.9:EntityConcernedID:KvKnr';

export const DIGID_ATTR_PRIMARY = 'sub';

export const OIDC_TOKEN_ID_ATTRIBUTE = {
  eherkenning: (tokenData: TokenData) => {
    if (FeatureToggle.ehKetenmachtigingActive) {
      if (
        EH_ATTR_INTERMEDIATE_PRIMARY_ID in tokenData &&
        EH_ATTR_INTERMEDIATE_SECONDARY_ID in tokenData
      ) {
        return EH_ATTR_INTERMEDIATE_PRIMARY_ID;
      }

      if (EH_ATTR_PRIMARY_ID in tokenData) {
        return EH_ATTR_PRIMARY_ID;
      }
    }

    // Attr Prior to 1.13
    return EH_ATTR_PRIMARY_ID_LEGACY;
  },
  digid: () => DIGID_ATTR_PRIMARY,
};

export type TokenIdAttribute =
  | typeof DIGID_ATTR_PRIMARY
  | typeof EH_ATTR_PRIMARY_ID;

export const TOKEN_ID_ATTRIBUTE: Record<AuthMethod, TokenIdAttribute> = {
  eherkenning: EH_ATTR_PRIMARY_ID,
  digid: DIGID_ATTR_PRIMARY,
};

export const OIDC_TOKEN_AUD_ATTRIBUTE_VALUE = {
  get eherkenning() {
    return oidcConfigEherkenning.clientID;
  },
  get digid() {
    return oidcConfigDigid.clientID;
  },
};
