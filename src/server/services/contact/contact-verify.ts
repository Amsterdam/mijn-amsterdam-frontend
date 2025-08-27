import type {
  CreateVerificationRequestPayload,
  VerifyVerificationRequestPayload,
  VerifyVerificationRequestResponse,
} from './contact-verify.types';
import type { AuthProfileAndToken } from '../../auth/auth-types';
import { getFromEnv } from '../../helpers/env';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';

type CreateVerificationRequestProps = {
  email: string;
};

export function createVerificationRequest(
  authProfileAndToken: AuthProfileAndToken,
  { email }: CreateVerificationRequestProps
) {
  const data: CreateVerificationRequestPayload = {
    email,
    reference: authProfileAndToken.profile.sid,
    templateId: `${getFromEnv('BFF_VERIFY_EMAIL_TEMPLATE_ID')}`,
    apiKey: `${getFromEnv('BFF_VERIFY_API_KEY')}`,
  };

  const apiConfig = getApiConfig('VERIFY', {
    data,
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
    reference: authProfileAndToken.profile.sid,
    code,
  };

  const apiConfig = getApiConfig('VERIFY', {
    formatUrl({ url }) {
      return `${url}/verify`;
    },
    data,
  });

  return requestData<VerifyVerificationRequestResponse>(apiConfig);
}
