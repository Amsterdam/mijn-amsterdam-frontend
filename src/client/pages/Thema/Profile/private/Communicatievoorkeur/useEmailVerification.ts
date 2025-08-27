import useSWRMutation from 'swr/mutation';

import type {
  CreateVerificationRequestResponse,
  VerifyVerificationRequestResponse,
} from '../../../../../../server/services/contact/contact-verify.types';
import {
  sendFormPostRequest,
  swrPostRequest,
} from '../../../../../hooks/api/useDataApi-v2';

type VerifyApiOptions = {
  url: string;
  onSuccess: (
    data: CreateVerificationRequestResponse | VerifyVerificationRequestResponse
  ) => void;
};

export function useCreateVerificationRequest(options: VerifyApiOptions) {
  const { trigger, isMutating, ...rest } =
    useSWRMutation<CreateVerificationRequestResponse>(
      options.url,
      swrPostRequest(sendFormPostRequest),
      {
        onSuccess(data) {
          options.onSuccess(data);
        },
      }
    );

  return {
    send: async ({ email }: { email: string }) => {
      console.log('send email', email);
      trigger({ email });
    },
    isMutating,
    ...rest,
  };
}

export function useVerifyVerificationRequest(options: VerifyApiOptions) {
  const { trigger, isMutating, ...rest } =
    useSWRMutation<VerifyVerificationRequestResponse>(
      options.url,
      swrPostRequest(sendFormPostRequest),
      {
        onSuccess(data) {
          options.onSuccess(data);
        },
      }
    );

  return {
    send: async ({ email, code }: { email: string; code: string }) => {
      console.log('send code', email, code);
      trigger({ email, code });
    },
    isMutating,
    ...rest,
  };
}
