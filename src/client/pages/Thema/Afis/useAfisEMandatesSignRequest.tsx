import { useEffect } from 'react';

import { Paragraph } from '@amsterdam/design-system-react';

import {
  AFIS_EMANDATE_LONG_DURATION_THRESHOLD_MS,
  EMANDATE_SIGN_REQUEST_SUCCESS_STATUSES,
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
  activationDate: string,
];

export function useSignRequestPayloadStorage() {
  const [payloads, setValue] = useLocalStorage<AfisEmandateStatusCheckTuple[]>(
    'afis-emandate-status-check-payload',
    []
  );

  // TODO: Add effect the cleans up old payloads that are no longer relevant to prevent unnecessary status checks and storage bloat.

  function get(
    eMandateId: AfisEMandateFrontend['id'],
    index: number
  ): string | null {
    const tuple = payloads.findLast((p) => p[0] === eMandateId) as
      | AfisEmandateStatusCheckTuple
      | undefined;
    return tuple ? tuple[index] : null;
  }

  return {
    payloads,
    add(eMandateId: AfisEMandateFrontend['id'], payload: string) {
      const activationDate = new Date().toISOString();
      const newPayloads: AfisEmandateStatusCheckTuple[] = [
        ...payloads,
        [eMandateId, payload, activationDate],
      ];
      setValue(newPayloads);
    },
    remove(eMandateId: AfisEMandateFrontend['id']) {
      const newPayloads = payloads.filter((p) => p[0] !== eMandateId);
      setValue(newPayloads);
    },
    getPayload(eMandateId: AfisEMandateFrontend['id']): string | null {
      return get(eMandateId, 1);
    },
    hasPendingStatusChecks(): boolean {
      //TODO: Also check for age of payload to prevent unnecessary status checks for old payloads.
      return payloads.length > 0;
    },
    isTakingLong(eMandateId: AfisEMandateFrontend['id']): boolean {
      const activationDate = get(eMandateId, 2);
      return activationDate
        ? new Date().getTime() - new Date(activationDate).getTime() >
            AFIS_EMANDATE_LONG_DURATION_THRESHOLD_MS
        : false;
    },
  };
}

// If a customer returns to Mijn Amsterdam from the eMandate signing process, we want to check the status of the sign request to see if the mandate has been activated.
// This is primarily relevant for the cancelled singing flow where we don't receive feedback from the eMandate provider and thus need to check the status to know if the signing was cancelled or
// if the customer just returned to Mijn Amsterdam before completing the signing process.
export function useSignRequestStatusCheck(eMandate: AfisEMandateFrontend) {
  const payloadStorage = useSignRequestPayloadStorage();
  const payload = payloadStorage.getPayload(eMandate.id);

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

  const statusResponse = api.data?.content?.status ?? '';

  const isPendingActivation =
    api.isDirty &&
    !!payload &&
    EMANDATE_SIGN_REQUEST_SUCCESS_STATUSES.includes(statusResponse) &&
    eMandate.status !== EMANDATE_STATUS_ACTIVE;

  useEffect(() => {
    if (!payload) {
      return;
    }
    // If the mandate is active or the sign request has failed, we can remove the payload from storage as we no longer need to check the status.
    return () => {
      if (
        eMandate.status === EMANDATE_STATUS_ACTIVE ||
        (statusResponse &&
          !EMANDATE_SIGN_REQUEST_SUCCESS_STATUSES.includes(statusResponse))
      ) {
        payloadStorage.remove(eMandate.id);
      }
    };
  }, [
    eMandate.id,
    payloadStorage,
    isPendingActivation,
    eMandate.status,
    payload,
    statusResponse,
  ]);

  return {
    ...api,
    payload,
    isPendingActivation,
    isRequestingStatusCheck:
      api.isLoading && !!payload && eMandate.status !== EMANDATE_STATUS_ACTIVE,
    isTakingLong: payloadStorage.isTakingLong(eMandate.id),
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
