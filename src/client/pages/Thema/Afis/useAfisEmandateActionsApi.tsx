import { useState, useEffect } from 'react';

import { useAfisEMandatesApi } from './useAfisEmandatesApi';
import { useSignRequestPayloadStorage } from './useAfisEMandatesSignRequest';
import type {
  AfisEMandateFrontend,
  AfisEMandateSignRequestResponse,
  AfisEMandateStatusChangeResponse,
  AfisEMandateUpdatePayloadFrontend,
} from '../../../../server/services/afis/afis-types';
import { entries } from '../../../../universal/helpers/utils';
import {
  useBffApi,
  sendFetchRequest,
  sendFormPostRequest,
} from '../../../hooks/api/useBffApi';

function useRedirectUrlApi(
  eMandate: AfisEMandateFrontend,
  payloadStorage: ReturnType<typeof useSignRequestPayloadStorage>
) {
  return useBffApi<AfisEMandateSignRequestResponse>(eMandate.signRequestUrl, {
    fetchImmediately: false,
    sendRequest: async (url) => {
      return sendFetchRequest<AfisEMandateSignRequestResponse>(url).then(
        (response) => {
          if (response.content?.redirectUrl) {
            payloadStorage.add(
              eMandate.id,
              response.content.statusCheckPayload
            );
            window.location.href = response.content?.redirectUrl;
          }
          return response;
        }
      );
    },
  });
}
type OptimisticUpdateFunction<T> = (
  eMandateId: string,
  payload: Partial<T>
) => void;
function useDeactivateApi(
  eMandate: AfisEMandateFrontend,
  optimisticUpdateContent: OptimisticUpdateFunction<AfisEMandateFrontend>
) {
  return useBffApi<AfisEMandateStatusChangeResponse>(eMandate.deactivateUrl, {
    fetchImmediately: false,
    sendRequest: async (url) => {
      return sendFetchRequest<AfisEMandateStatusChangeResponse>(url).then(
        (response) => {
          if (response.content) {
            optimisticUpdateContent(eMandate.id, response.content);
          }
          return response;
        }
      );
    },
  });
}
function useLifetimeUpdateApi(
  eMandate: AfisEMandateFrontend,
  optimisticUpdateContent: OptimisticUpdateFunction<AfisEMandateFrontend>
) {
  return useBffApi<AfisEMandateUpdatePayloadFrontend>(
    eMandate?.lifetimeUpdateUrl,
    {
      fetchImmediately: false,
      sendRequest: async (url, init) => {
        return sendFormPostRequest<AfisEMandateUpdatePayloadFrontend>(
          url,
          init
        ).then((response) => {
          if (response.content) {
            optimisticUpdateContent(eMandate.id, response.content);
          }
          return response;
        });
      },
    }
  );
}

export function useEmandateApis(eMandate: AfisEMandateFrontend) {
  const { optimisticUpdateContent } = useAfisEMandatesApi();
  const payloadStorage = useSignRequestPayloadStorage();

  const redirectUrlApi = useRedirectUrlApi(eMandate, payloadStorage);
  const deactivateApi = useDeactivateApi(eMandate, optimisticUpdateContent);
  const lifetimeUpdateApi = useLifetimeUpdateApi(
    eMandate,
    optimisticUpdateContent
  );

  type ApiName = 'redirectUrlApi' | 'deactivateApi' | 'lifetimeUpdateApi';

  const [showError, setShowError] = useState(false);
  const [lastActiveApi, setLastActiveApi] = useState<ApiName | null>(null);

  useEffect(() => {
    entries({
      redirectUrlApi: redirectUrlApi.isLoading,
      deactivateApi: deactivateApi.isLoading,
      lifetimeUpdateApi: lifetimeUpdateApi.isLoading,
    }).forEach(([apiName, isLoading]) => {
      if (isLoading) {
        setLastActiveApi(apiName);
      }
    });
  }, [
    redirectUrlApi.isLoading,
    deactivateApi.isLoading,
    lifetimeUpdateApi.isLoading,
  ]);

  const isErrorVisible =
    showError &&
    !redirectUrlApi.isLoading &&
    !deactivateApi.isLoading &&
    !lifetimeUpdateApi.isLoading &&
    (redirectUrlApi.isError ||
      deactivateApi.isError ||
      !!lifetimeUpdateApi.isError);

  useEffect(() => {
    entries({
      redirectUrlApi: redirectUrlApi.isError,
      deactivateApi: deactivateApi.isError,
      lifetimeUpdateApi: lifetimeUpdateApi.isError,
    }).forEach(([apiName, isError]) => {
      if (apiName === lastActiveApi && isError) {
        setShowError(true);
      }
    });
  }, [
    redirectUrlApi.isError,
    deactivateApi.isError,
    lastActiveApi,
    lifetimeUpdateApi.isError,
  ]);

  return {
    redirectUrlApi,
    deactivateApi,
    lifetimeUpdateApi: {
      ...lifetimeUpdateApi,
      update(dateValidTo: string) {
        lifetimeUpdateApi.fetch({ payload: { dateValidTo } });
      },
    },
    isErrorVisible,
    lastActiveApi,
    hideError: () => {
      setShowError(false);
    },
  };
}
