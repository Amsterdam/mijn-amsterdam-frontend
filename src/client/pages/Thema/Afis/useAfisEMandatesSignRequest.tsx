import { useEffect } from 'react';

import { Paragraph } from '@amsterdam/design-system-react';

import {
  EMANDATE_SIGN_REQUEST_FAILED_STATUSES,
  EMANDATE_STATUS_ACTIVE,
} from './Afis-thema-config';
import type {
  AfisEMandateFrontend,
  AfisEMandateSignRequestStatusResponse,
} from '../../../../server/services/afis/afis-types';
import { useBffApi } from '../../../hooks/api/useBffApi';
import { useLocalStorage } from '../../../hooks/storage.hook';

type AfisEmandateStatusCheckTuple = [
  eMandateId: AfisEMandateFrontend['id'],
  payload: string,
];

export function useSignRequestPayloadStorage() {
  const [payloads, setValue] = useLocalStorage<AfisEmandateStatusCheckTuple[]>(
    'afis-emandate-status-check-payload',
    []
  );

  return {
    payloads,
    add(eMandateId: AfisEMandateFrontend['id'], payload: string) {
      const newPayloads: AfisEmandateStatusCheckTuple[] = [
        ...payloads,
        [eMandateId, payload],
      ];
      setValue(newPayloads);
    },
    remove(eMandateId: AfisEMandateFrontend['id']) {
      const newPayloads = payloads.filter((p) => p[0] !== eMandateId);
      setValue(newPayloads);
    },
    get(eMandateId: AfisEMandateFrontend['id']): string | null {
      const tuple = payloads.findLast((p) => p[0] === eMandateId);
      return tuple ? tuple[1] : null;
    },
    hasPendingStatusChecks(): boolean {
      return payloads.length > 0;
    },
  };
}

export function useSignRequestStatusCheck(eMandate: AfisEMandateFrontend) {
  const payloadStorage = useSignRequestPayloadStorage();
  const payload = payloadStorage.get(eMandate.id);

  // Only perform the status check if there's a payload in storage and the mandate is not active yet (to prevent unnecessary checks after activation).
  const api = useBffApi<AfisEMandateSignRequestStatusResponse>(
    payload
      ? `${eMandate.signRequestStatusUrl}?statusCheckPayload=${encodeURIComponent(
          payload
        )}`
      : null,
    {
      fetchImmediately: !!payload,
    }
  );

  const isPendingActivation = !EMANDATE_SIGN_REQUEST_FAILED_STATUSES.includes(
    api.data?.content?.status ?? ''
  );

  useEffect(() => {
    if (!payload) {
      return;
    }
    // If the mandate is active or the sign request has failed, we can remove the payload from storage as we no longer need to check the status.
    if (!isPendingActivation || eMandate.status === EMANDATE_STATUS_ACTIVE) {
      payloadStorage.remove(eMandate.id);
    }
  }, [
    eMandate.id,
    payloadStorage,
    isPendingActivation,
    eMandate.status,
    payload,
  ]);

  return {
    ...api,
    payload,
    isPendingActivation:
      api.isDirty &&
      !!payload &&
      !EMANDATE_SIGN_REQUEST_FAILED_STATUSES.includes(
        api.data?.content?.status ?? ''
      ) &&
      eMandate.status !== EMANDATE_STATUS_ACTIVE,
    isRequestingStatusCheck:
      api.isLoading && !!payload && eMandate.status !== EMANDATE_STATUS_ACTIVE,
    cancel: () => {
      payloadStorage.remove(eMandate.id);
    },
  };
}

type CheckStatusProps = {
  eMandate: AfisEMandateFrontend;
};

export function CheckStatus({ eMandate }: CheckStatusProps) {
  const signRequestStatusCheckApi = useSignRequestStatusCheck(eMandate);
  return signRequestStatusCheckApi.isRequestingStatusCheck ? (
    <Paragraph>Controleren...</Paragraph>
  ) : signRequestStatusCheckApi.isPendingActivation ? (
    <>Wachten op activatie</>
  ) : (
    eMandate.displayStatus
  );
}
