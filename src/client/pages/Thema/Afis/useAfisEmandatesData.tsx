import { useState, useEffect } from 'react';

import { Paragraph } from '@amsterdam/design-system-react';
import isEqual from 'lodash.isequal';
import { useNavigate, useParams } from 'react-router';

import { generateApiUrl } from './Afis-helpers';
import {
  routeConfig,
  eMandateTableConfig,
  titleBetaalvoorkeurenPage,
  titleEMandaatPage,
  featureToggle,
} from './Afis-thema-config';
import { useAfisThemaData } from './useAfisThemaData.hook';
import type {
  AfisEMandateFrontend,
  AfisEMandateSignRequestResponse,
  AfisEMandateStatusChangeResponse,
  AfisEMandateUpdatePayloadFrontend,
} from '../../../../server/services/afis/afis-types';
import { entries } from '../../../../universal/helpers/utils';
import { MaRouterLink } from '../../../components/MaLink/MaLink';
import {
  sendFormPostRequest,
  sendGetRequest,
  useBffApi,
} from '../../../hooks/api/useBffApi';
import { useSmallScreen } from '../../../hooks/media.hook';
import { useSessionStorage } from '../../../hooks/storage.hook';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems';

function updateEmandateById(
  id: AfisEMandateFrontend['id'],
  payload: Partial<AfisEMandateFrontend>,
  eMandates: AfisEMandateFrontend[] | undefined
): AfisEMandateFrontend[] {
  if (!eMandates) {
    return eMandates ?? [];
  }
  return eMandates.map((mandate) => {
    if (mandate.id === id) {
      return {
        ...mandate,
        ...payload,
      };
    }
    return mandate;
  });
}

export function useAfisEMandatesData() {
  const isSmallScreen = useSmallScreen();

  const { businessPartnerIdEncrypted, themaId } = useAfisThemaData();

  const {
    isLoading,
    isError,
    isDirty,
    data: eMandatesApiResponse,
    fetch,
    optimisticUpdateContent,
  } = useBffApi<AfisEMandateFrontend[]>(
    generateApiUrl(businessPartnerIdEncrypted, 'AFIS_EMANDATES'),
    {
      fetchImmediately: featureToggle.afisEMandatesActive,
    }
  );

  const EMandatesSource = eMandatesApiResponse?.content ?? [];

  const eMandates = EMandatesSource.map((eMandate) => {
    return {
      ...eMandate,
      detailLinkComponent: (
        <>
          <MaRouterLink maVariant="fatNoUnderline" href={eMandate.link.to}>
            {eMandate.link.title}
          </MaRouterLink>
          {!isSmallScreen && eMandate.creditorDescription && (
            <Paragraph size="small">{eMandate.creditorDescription}</Paragraph>
          )}
        </>
      ),
      get displayStatus() {
        return statusNotificationStorage.isPendingActivation(
          eMandate.creditorIBAN
        )
          ? 'Wachten op activatie'
          : eMandate.displayStatus;
      },
    };
  });

  const statusNotificationStorage = useEmandateStatusPendingStorage(eMandates);

  const breadcrumbs = [
    ...useThemaBreadcrumbs(themaId),
    { to: routeConfig.betaalVoorkeuren.path, title: titleBetaalvoorkeurenPage },
  ];
  const { id } = useParams<{ id: AfisEMandateFrontend['id'] }>();
  const eMandate = eMandates.find((mandate) => mandate.id === id);

  return {
    themaId,
    breadcrumbs,
    eMandate,
    eMandates,
    eMandateTableConfig,
    hasEMandatesError: isError,
    isLoadingEMandates: isLoading && !isDirty,
    optimisticUpdateContent: (
      eMandateId: string,
      payload: Partial<AfisEMandateFrontend>
    ) => {
      optimisticUpdateContent(
        updateEmandateById(eMandateId, payload, eMandates)
      );
    },
    statusNotification: statusNotificationStorage,
    title: titleEMandaatPage,
    fetchEMandates: () => {
      fetch();
    },
  };
}

export function useEmandateApis(eMandate: AfisEMandateFrontend) {
  const { optimisticUpdateContent, statusNotification } =
    useAfisEMandatesData();

  const redirectUrlApi = useBffApi<AfisEMandateSignRequestResponse>(
    eMandate.signRequestUrl,
    {
      fetchImmediately: false,
      sendRequest: async (url) => {
        return sendGetRequest<AfisEMandateSignRequestResponse>(url).then(
          (response) => {
            if (response.content?.redirectUrl) {
              window.location.href = response.content?.redirectUrl;
            }
            return response;
          }
        );
      },
    }
  );

  const statusChangeApi = useBffApi<AfisEMandateStatusChangeResponse>(
    eMandate.statusChangeUrl,
    {
      fetchImmediately: false,
      sendRequest: async (url) => {
        return sendGetRequest<AfisEMandateStatusChangeResponse>(url).then(
          (response) => {
            if (response.content) {
              optimisticUpdateContent(eMandate.id, response.content);
            }
            return response;
          }
        );
      },
    }
  );

  const lifetimeUpdateApi = useBffApi<AfisEMandateUpdatePayloadFrontend>(
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

  type ApiName = 'redirectUrlApi' | 'statusChangeApi' | 'lifetimeUpdateApi';

  const [showError, setShowError] = useState(false);
  const [lastActiveApi, setLastActiveApi] = useState<ApiName | null>(null);

  useEffect(() => {
    entries({
      redirectUrlApi: redirectUrlApi.isLoading,
      statusChangeApi: statusChangeApi.isLoading,
      lifetimeUpdateApi: lifetimeUpdateApi.isLoading,
    }).forEach(([apiName, isLoading]) => {
      if (isLoading) {
        setLastActiveApi(apiName);
      }
    });
  }, [
    redirectUrlApi.isLoading,
    statusChangeApi.isLoading,
    lifetimeUpdateApi.isLoading,
  ]);

  const isErrorVisible =
    showError &&
    !redirectUrlApi.isLoading &&
    !statusChangeApi.isLoading &&
    !lifetimeUpdateApi.isLoading &&
    (redirectUrlApi.isError ||
      statusChangeApi.isError ||
      !!lifetimeUpdateApi.isError);

  useEffect(() => {
    entries({
      redirectUrlApi: redirectUrlApi.isError,
      statusChangeApi: statusChangeApi.isError,
      lifetimeUpdateApi: lifetimeUpdateApi.isError,
    }).forEach(([apiName, isError]) => {
      if (apiName === lastActiveApi && isError) {
        setShowError(true);
      }
    });
  }, [
    redirectUrlApi.isError,
    statusChangeApi.isError,
    lastActiveApi,
    lifetimeUpdateApi.isError,
  ]);

  return {
    redirectUrlApi,
    statusChangeApi,
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
    statusNotification,
  };
}

/**
 * This hook synchronizes the state of pending IBANs with session storage to
 * ensure persistence across page reloads within the same session. It also
 * ensures that changes to the state are reflected in session storage.
 */
function useIsPendingNotification() {
  const [ibansPendingActivation_, setIsPendingActivation_] = useSessionStorage(
    'afis-emandate-pending-activation',
    ''
  );

  const [ibansPendingActivation, setIsPendingActivation] = useState<string[]>(
    ibansPendingActivation_.split(',').filter(Boolean)
  );

  const ibansPendingActivationCurrent = ibansPendingActivation.join(',');

  useEffect(() => {
    if (ibansPendingActivation_ !== ibansPendingActivationCurrent) {
      setIsPendingActivation_(ibansPendingActivationCurrent);
    }
  }, [
    ibansPendingActivationCurrent,
    ibansPendingActivation_,
    setIsPendingActivation_,
  ]);

  return {
    ibansPendingActivation,
    isPendingActivation: (iban: string) =>
      ibansPendingActivation.includes(iban),
    setIsPendingActivation,
    removePendingActivation: (iban: string) => {
      const updatedIbans = ibansPendingActivation.filter((i) => i !== iban);
      setIsPendingActivation(updatedIbans);
    },
  };
}

/**
 * Custom hook to manage and update the pending activation status of eMandates.
 *
 * This hook processes the current eMandates and updates the list of IBANs that are
 * pending activation. It also ensures that the `iban` query parameter is removed
 * from the URL after processing.
 *
 * - The hook listens for changes in the `eMandates`, `iban` query parameter, and the
 *   current list of pending IBANs to determine if updates are needed.
 * - If an eMandate's status is not '1' and the `iban` query parameter is present, the
 *   IBAN is added to the pending activation list.
 * - If an eMandate's status is '1', its associated creditor IBAN is removed from the
 *   pending activation list.
 * - The hook uses `useNavigate` to remove the `iban` query parameter from the URL after
 *   processing, replacing the current URL without reloading the page.
 */
export function useEmandateStatusPendingStorage(
  eMandates?: AfisEMandateFrontend[]
) {
  const queryParams = new URLSearchParams(window.location.search);
  const iban = queryParams.get('iban');

  const pendingStorage = useIsPendingNotification();
  const { ibansPendingActivation, setIsPendingActivation } = pendingStorage;
  const navigate = useNavigate();

  useEffect(() => {
    if (!eMandates?.length) {
      return;
    }

    let updatedIbansPendingActivation: string[] = [...ibansPendingActivation];

    // Update the pending activation list based on the current eMandates status.
    eMandates.forEach((eMandate) => {
      if (
        eMandate?.status !== '1' &&
        iban &&
        !updatedIbansPendingActivation.includes(iban)
      ) {
        updatedIbansPendingActivation.push(iban);
      }
      if (
        eMandate?.status === '1' &&
        eMandate?.creditorIBAN &&
        updatedIbansPendingActivation.includes(eMandate?.creditorIBAN)
      ) {
        updatedIbansPendingActivation = updatedIbansPendingActivation.filter(
          (i) => i !== eMandate.creditorIBAN
        );
      }
    });

    if (!isEqual(updatedIbansPendingActivation, ibansPendingActivation)) {
      setIsPendingActivation(updatedIbansPendingActivation);
    }

    // Make sure the iban query parameter is removed after processing.
    // Beware that any other query param will also be removed.
    if (iban) {
      navigate(window.location.pathname, {
        replace: true,
      });
    }
  }, [
    iban,
    eMandates,
    ibansPendingActivation,
    setIsPendingActivation,
    navigate,
  ]);

  return pendingStorage;
}

export const forTesting = {
  updateEmandateById,
  useIsPendingNotification,
};
