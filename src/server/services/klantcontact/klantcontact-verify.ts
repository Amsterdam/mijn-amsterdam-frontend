import createDebugger from 'debug';

import { getProfileType } from './klantcontact-helpers.ts';
import type {
  CreateVerificationRequestPayload,
  CreateVerificationRequestResponse,
  VerifyVerificationRequestPayload,
  VerifyVerificationRequestResponse,
} from './klantcontact-verify.types.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import { getApiConfig } from '../../helpers/source-api-helpers.ts';
import { requestData } from '../../helpers/source-api-request.ts';

const DEFAULT_DIENST_ID = 1; // the default dienst is created automatically for every dienstverlener

const debugVerifyApiRequestData = createDebugger('verify-api:request-data');
const debugVerifyApiResponseData = createDebugger('verify-api:response-data');

type CreateVerificationRequestProps = {
  email?: string;
  phone?: string;
};

export function createVerificationRequest(
  authProfileAndToken: AuthProfileAndToken,
  { email, phone }: CreateVerificationRequestProps,
  dienstId: number = DEFAULT_DIENST_ID
) {
  const medium: CreateVerificationRequestPayload['type'] | null = email
    ? 'Email'
    : phone
      ? 'Telefoonnummer'
      : null;

  if (!medium) {
    throw new Error('Either Email or Telefoonnummer must be provided');
  }

  // There must be a medium, so we use the bang! operator
  const mediumValue = (medium === 'Email' ? email : phone)!;

  const profileType = getProfileType(authProfileAndToken.profile.profileType);
  const payload: CreateVerificationRequestPayload = {
    type: medium,
    waarde: mediumValue,
    scope: {
      scopeIdentificatieType: profileType,
      scopeIdentificatieNummer: authProfileAndToken.profile.id,
      dienstId,
    },
  };

  debugVerifyApiRequestData({ data: payload });

  const apiConfig = getApiConfig('CONTACT', {
    method: 'POST',
    data: payload,
    transformResponse: (response) => {
      debugVerifyApiResponseData(response);
      return response;
    },
    formatUrl({ url }) {
      return `${url}/contactgegeven/${profileType}/${authProfileAndToken.profile.id}`;
    },
  });

  return requestData<CreateVerificationRequestResponse>(apiConfig);
}

type VerifyVerificationRequestProps = {
  email: string;
  code: string;
};

export function verifyVerificationRequest(
  authProfileAndToken: AuthProfileAndToken,
  { email, code }: VerifyVerificationRequestProps
) {
  const profileType = getProfileType(authProfileAndToken.profile.profileType);
  const data: VerifyVerificationRequestPayload = {
    email,
    identificatieNummer: authProfileAndToken.profile.id,
    identificatieType: profileType,
    verificatieCode: code,
  };

  debugVerifyApiRequestData({ data });

  const apiConfig = getApiConfig('CONTACT', {
    method: 'POST',
    data,
    transformResponse: (response) => {
      debugVerifyApiResponseData({ response });
      return response;
    },
    formatUrl({ url }) {
      return `${url}/emailverificatie`;
    },
    enableCache: false, // For testing
  });

  return requestData<VerifyVerificationRequestResponse>(apiConfig);
}
