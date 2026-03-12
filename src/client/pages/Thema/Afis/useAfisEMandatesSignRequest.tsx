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

type AfisEmandateStatusCheckPayload = {
  eMandateId: AfisEMandateFrontend['id'];
  eMandateIdSource: string;
  payload: string;
  activationDate: string;
  isReplacement: 'true' | 'false';
};

export function useSignRequestPayloadStorage() {
  const [payloads, setValue] = useLocalStorage<
    AfisEmandateStatusCheckPayload[]
  >('afis-emandate-status-check-payload', []);

  function get(
    eMandateId: AfisEMandateFrontend['id'],
    property: keyof AfisEmandateStatusCheckPayload
  ): string | null {
    const statusCheck = payloads.findLast(
      (p) => p.eMandateId === eMandateId
    ) as AfisEmandateStatusCheckPayload | undefined;
    return statusCheck ? statusCheck[property] : null;
  }

  return {
    payloads,
    add(
      eMandateId: AfisEMandateFrontend['id'],
      eMandateIdSource: string,
      payload: string,
      isReplacement: boolean = false
    ) {
      const activationDate = new Date().toISOString();
      const newPayloads: AfisEmandateStatusCheckPayload[] = [
        ...payloads,
        {
          eMandateId,
          eMandateIdSource,
          payload,
          activationDate,
          isReplacement: isReplacement ? 'true' : 'false',
        },
      ];
      setValue(newPayloads);
    },
    remove(eMandateId: AfisEMandateFrontend['id']) {
      const newPayloads = payloads.filter((p) => p.eMandateId !== eMandateId);
      setValue(newPayloads);
    },
    getPayload(eMandateId: AfisEMandateFrontend['id']): string | null {
      return get(eMandateId, 'payload');
    },
    hasPayloads(): boolean {
      return payloads.length > 0;
    },
    isTakingLong(eMandateId: AfisEMandateFrontend['id']): boolean {
      const activationDate = get(eMandateId, 'activationDate');
      return activationDate
        ? new Date().getTime() - new Date(activationDate).getTime() >
            AFIS_EMANDATE_LONG_DURATION_THRESHOLD_MS
        : false;
    },
    isReplacement(eMandateId: AfisEMandateFrontend['id']): boolean {
      const isReplacement = get(eMandateId, 'isReplacement');
      return isReplacement === 'true';
    },
    isReplaced(
      eMandateId: AfisEMandateFrontend['id'],
      eMandateIdSource: AfisEMandateFrontend['eMandateIdSource']
    ): boolean {
      const lastPayload = payloads.findLast((p) => p.eMandateId === eMandateId);

      return lastPayload
        ? lastPayload.eMandateIdSource !== eMandateIdSource?.toString()
        : false;
    },
  };
}

export function useSignRequestPayloadStorageCleanup(
  EMandatesSource: AfisEMandateFrontend[]
) {
  const payloadStorage = useSignRequestPayloadStorage();

  useEffect(() => {
    if (EMandatesSource.length) {
      const obsoleteStatusCheckIds = EMandatesSource.filter(
        ({ id, status, eMandateIdSource }) => {
          if (!payloadStorage.getPayload(id)) {
            return false;
          }
          return payloadStorage.isReplacement(id)
            ? payloadStorage.isReplaced(id, eMandateIdSource)
            : status !== '0';
        }
      ).map(({ id }) => id);

      obsoleteStatusCheckIds.forEach((id) => {
        payloadStorage.remove(id);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [EMandatesSource]);
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
  const isUpdatingEMandateStatus =
    !!payload && payloadStorage.isReplacement(eMandate.id)
      ? !payloadStorage.isReplaced(eMandate.id, eMandate.eMandateIdSource)
      : eMandate.status !== EMANDATE_STATUS_ACTIVE;

  const isPendingActivation = api.isLoading
    ? !!payload
    : api.isDirty &&
      isUpdatingEMandateStatus &&
      EMANDATE_SIGN_REQUEST_SUCCESS_STATUSES.includes(statusResponse);

  return {
    ...api,
    payload,
    isPendingActivation,
    isRequestingStatusCheck: api.isLoading && isUpdatingEMandateStatus,
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
