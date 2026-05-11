import createDebugger from 'debug';

import type {
  CreateVerificationRequestPayload,
  CreateVerificationRequestResponse,
  VerifyVerificationRequestPayload,
  VerifyVerificationRequestResponse,
} from './contact-verify.types';
import type { AuthProfileAndToken } from '../../auth/auth-types';
import { getFromEnv } from '../../helpers/env';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';

const debugVerifyApiRequestData = createDebugger('verify-api:request-data');
const debugVerifyApiResponseData = createDebugger('verify-api:response-data');

type CreateVerificationRequestProps = {
  email?: string;
  phone?: string;
};

const VERIFY_REFERENCE_STATIC = 'Mijn Amsterdam';

function getUniqueReference(email: string) {
  return `${email}-${VERIFY_REFERENCE_STATIC}`;
}

export function createVerificationRequest(
  authProfileAndToken: AuthProfileAndToken,
  { email, phone }: CreateVerificationRequestProps
) {
  const medium: 'email' | 'phone' | null = email
    ? 'email'
    : phone
      ? 'phone'
      : null;

  if (!medium) {
    throw new Error('Either email or phone must be provided');
  }

  // There must be a medium, so we use the bang! operator
  const mediumValue = (medium === 'email' ? email : phone)!;

  const payload: CreateVerificationRequestPayload<typeof medium> = {
    reference: getUniqueReference(mediumValue),
    templateId: `${getFromEnv(`BFF_VERIFY_${medium.toUpperCase()}_TEMPLATE_ID`)}`,
    apiKey: `${getFromEnv('BFF_VERIFY_API_KEY')}`,
    ...(medium === 'email'
      ? { email: mediumValue }
      : { phoneNumber: mediumValue }),
  };

  debugVerifyApiRequestData({ data: payload });

  const apiConfig = getApiConfig('VERIFY', {
    data: payload,
    transformResponse: (response) => {
      debugVerifyApiResponseData(response);
      return response;
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
  const data: VerifyVerificationRequestPayload = {
    email,
    reference: getUniqueReference(email),
    code,
  };

  debugVerifyApiRequestData({ data });

  const apiConfig = getApiConfig('VERIFY', {
    formatUrl({ url }) {
      return `${url}/verify`;
    },
    transformResponse: (response) => {
      debugVerifyApiResponseData({ response });
      return response;
    },
    data,
  });

  return requestData<VerifyVerificationRequestResponse>(apiConfig);
}
