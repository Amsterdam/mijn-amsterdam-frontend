import { ConfigParams } from 'express-openid-connect';
import * as jose from 'jose';
import { FeatureToggle } from '../../universal/config/feature-toggles';
import { getFromEnv } from '../helpers/env';
import { BFF_OIDC_BASE_URL, BFF_OIDC_ISSUER_BASE_URL } from './auth-routes';
import { TokenData } from './auth-types';

export const OIDC_SESSION_MAX_AGE_SECONDS = 15 * 60; // 15 minutes
export const OIDC_SESSION_COOKIE_NAME = '__MA-appSession';
export const OIDC_COOKIE_ENCRYPTION_KEY = `${getFromEnv('BFF_GENERAL_ENCRYPTION_KEY')}`;
export const OIDC_ID_TOKEN_EXP = '1 hours'; // Arbitrary, MA wants a token to be valid for a maximum of 1 hours.
export const OIDC_IS_TOKEN_EXP_VERIFICATION_ENABLED = true;

const oidcConfigBase: ConfigParams = {
  authRequired: false,
  auth0Logout: false,
  idpLogout: true,
  // Cookie encryption
  secret: OIDC_COOKIE_ENCRYPTION_KEY,
  // Client secret
  clientSecret: getFromEnv('BFF_OIDC_SECRET'),
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
  afterCallback: (req, res, session) => {
    const claims = jose.decodeJwt(session.id_token) as {
      nonce: string;
    };

    const authVerification = JSON.parse(
      req.cookies.auth_verification.split('.')[0]
    );

    if (claims.nonce !== authVerification.nonce) {
      throw new Error(`Nonce invalid`);
    }

    if (req.query.state !== authVerification.state) {
      throw new Error(`State invalid`);
    }

    return session;
  },
};

export const oidcConfigDigid: ConfigParams = {
  ...oidcConfigBase,
  clientID: getFromEnv('BFF_OIDC_CLIENT_ID_DIGID'),
};

export const oidcConfigEherkenning: ConfigParams = {
  ...oidcConfigBase,
  clientID: getFromEnv('BFF_OIDC_CLIENT_ID_EHERKENNING'),
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
