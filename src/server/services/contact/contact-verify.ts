import createDebugger from 'debug';

import type {
  CreateVerificationRequestPayload,
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
  email: string;
};

const VERIFY_REFERENCE_STATIC = 'Mijn Amsterdam';

function getUniqueReference(email: string) {
  return `${email}-${VERIFY_REFERENCE_STATIC}`;
}

export function createVerificationRequest(
  authProfileAndToken: AuthProfileAndToken,
  { email }: CreateVerificationRequestProps
) {
  const data: CreateVerificationRequestPayload = {
    email,
    reference: getUniqueReference(email),
    templateId: `${getFromEnv('BFF_VERIFY_EMAIL_TEMPLATE_ID')}`,
    apiKey: `${getFromEnv('BFF_VERIFY_API_KEY')}`,
  };

  debugVerifyApiRequestData({ data });

  const apiConfig = getApiConfig('VERIFY', {
    data,
    transformResponse: (response) => {
      debugVerifyApiResponseData(response);
      return response;
    },
  });

  return requestData<CreateVerificationRequestPayload>(apiConfig);
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
