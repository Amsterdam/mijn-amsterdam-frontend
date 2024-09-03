import { auth, ConfigParams } from 'express-openid-connect';
import { FeatureToggle } from '../../universal/config/feature-toggles';
import { ONE_HOUR_MS } from '../config/app';
import { getFromEnv } from '../helpers/env';
import { BFF_OIDC_BASE_URL, BFF_OIDC_ISSUER_BASE_URL } from './auth-routes';
import { TokenData } from './auth-types';

export const RETURNTO_AMSAPP_STADSPAS_ADMINISTRATIENUMMER =
  'amsapp-stadspas-administratienummer';
export const RETURNTO_MAMS_LANDING = 'mams-landing';

export const OIDC_SESSION_MAX_AGE_SECONDS = 15 * 60; // 15 minutes
export const OIDC_SESSION_COOKIE_NAME = '__MA-appSession';
export const OIDC_COOKIE_ENCRYPTION_KEY = `${getFromEnv('BFF_GENERAL_ENCRYPTION_KEY')}`;
export const OIDC_ID_TOKEN_EXP = '1 hours'; // Arbitrary, MA wants a token to be valid for a maximum of 1 hours.
export const OIDC_IS_TOKEN_EXP_VERIFICATION_ENABLED = true;

export const OIDC_TOKEN_EXP = ONE_HOUR_MS * 24 * 3; // The TMA currently has a token expiration time of 3 hours

export const openIdAuth = auth;

export const oidcConfigBase: ConfigParams = {
  authRequired: false,
  auth0Logout: false,
  // Tries to logout at the IDP's end_session endpoint.
  idpLogout: true,
  // Cookie encryption
  secret: OIDC_COOKIE_ENCRYPTION_KEY,
  // Client secret
  clientSecret: process.env.BFF_OIDC_SECRET,
  clientID: 'x', // Set in configs for digid and eherkenning.
  baseURL: BFF_OIDC_BASE_URL,
  issuerBaseURL: BFF_OIDC_ISSUER_BASE_URL,
  attemptSilentLogin: false,
  authorizationParams: { prompt: 'login', response_type: 'code' },
  clockTolerance: 120, // 2 minutes
  session: {
    rolling: true,
    rollingDuration: OIDC_SESSION_MAX_AGE_SECONDS,
    name: OIDC_SESSION_COOKIE_NAME,
  },
  routes: {
    login: false,
    logout: false,
    callback: false,
  },
  httpTimeout: 10000,
};

export const oidcConfigDigid: ConfigParams = {
  ...oidcConfigBase,
  clientID: process.env.BFF_OIDC_CLIENT_ID_DIGID,
  afterCallback: async (req, res, session) => {
    return {
      ...session,
      profileType: 'private',
      authMethod: 'digid',
    };
  },
};

export const oidcConfigEherkenning: ConfigParams = {
  ...oidcConfigBase,
  clientID: process.env.BFF_OIDC_CLIENT_ID_EHERKENNING,
  afterCallback: async (req, res, session) => {
    return {
      ...session,
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

export const profileTypeByAuthMethod: Record<AuthMethod, ProfileType[]> = {
  digid: ['private'],
  eherkenning: ['commercial'],
};

export const OIDC_TOKEN_AUD_ATTRIBUTE_VALUE = {
  get eherkenning() {
    return oidcConfigEherkenning.clientID;
  },
  get digid() {
    return oidcConfigDigid.clientID;
  },
};
