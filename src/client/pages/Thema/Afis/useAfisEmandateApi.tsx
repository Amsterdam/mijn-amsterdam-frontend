import { useState, useEffect } from 'react';

import { Paragraph } from '@amsterdam/design-system-react';
import isEqual from 'lodash.isequal';
import { useNavigate, useParams } from 'react-router';

import {
  themaId,
  routeConfig,
  eMandateTableConfig,
  businessPartnerDetailsLabels,
} from './Afis-thema-config';
import { useAfisThemaData } from './useAfisThemaData.hook';
import type {
  AfisBusinessPartnerDetailsTransformed,
  AfisEMandateFrontend,
  AfisEMandateSignRequestResponse,
  AfisEMandateStatusChangeResponse,
  AfisEMandateUpdatePayloadFrontend,
  AfisThemaResponse,
} from '../../../../server/services/afis/afis-types';
import { hasFailedDependency } from '../../../../universal/helpers/api';
import { entries } from '../../../../universal/helpers/utils';
import { MaRouterLink } from '../../../components/MaLink/MaLink';
import { BFFApiUrls } from '../../../config/api';
import { generateBffApiUrlWithEncryptedPayloadQuery } from '../../../helpers/api';
import {
  sendFormPostRequest,
  sendGetRequest,
  useBffApi,
  useBffApiStateStore,
} from '../../../hooks/api/useBffApi';
import { useSmallScreen } from '../../../hooks/media.hook';
import { useSessionStorage } from '../../../hooks/storage.hook';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems';

function generateApiUrl(
  businessPartnerIdEncrypted: string | null,
  route: keyof typeof BFFApiUrls
) {
  return businessPartnerIdEncrypted
    ? generateBffApiUrlWithEncryptedPayloadQuery(
        route,
        businessPartnerIdEncrypted
      )
    : null;
}

export function optimisticEmandatesUpdate(
  eMandate: AfisEMandateFrontend,
  payload: Record<string, string>
) {
  return (eMandates: AfisEMandateFrontend[] | undefined) => {
    if (!eMandates) {
      return eMandates;
    }
    return eMandates.map((mandate) => {
      if (mandate.id === eMandate?.id) {
        return {
          ...mandate,
          ...payload,
        };
      }
      return mandate;
    });
  };
}

export function useAfisEmandateUpdate(
  businessPartnerIdEncrypted: string | null,
  eMandate: AfisEMandateFrontend | null
) {
  const bffApiStateStore = useBffApiStateStore();
  const {
    fetch,
    isLoading: isUpdating,
    data,
    ...rest
  } = useBffApi<AfisEMandateUpdatePayloadFrontend>(
    eMandate?.lifetimeUpdateUrl,
    {
      fetchImmediately: false,
      sendRequest: sendFormPostRequest,
    }
  );

  // TODO: Update the state so we can optimistically update the mandate in the list, use bffApiStateStore
  //optimisticEmandatesUpdate(eMandate, eMandateUpdatePayload)
  const url = generateApiUrl(businessPartnerIdEncrypted, 'AFIS_EMANDATES');
  if (url && eMandate && data?.content) {
    const eMandates = bffApiStateStore.get(url);
    if (eMandates?.data?.content) {
      bffApiStateStore.set(
        url,
        optimisticEmandatesUpdate(
          eMandate,
          data?.content
        )(eMandates.data?.content)
      );
    }
  }

  return {
    update: async (dateValidTo: string) => {
      fetch(eMandate?.lifetimeUpdateUrl, { payload: { dateValidTo } });
    },
    isUpdating,
    ...rest,
  };
}

export function useAfisEMandatesData() {
  const isSmallScreen = useSmallScreen();

  const { businessPartnerIdEncrypted } = useAfisThemaData();
  const { title: betaalVoorkeurenTitle } = useAfisBetaalVoorkeurenData(
    businessPartnerIdEncrypted
  );

  const {
    isLoading,
    isError,
    data: eMandatesApiResponse,
  } = useBffApi<AfisEMandateFrontend[]>(
    generateApiUrl(businessPartnerIdEncrypted, 'AFIS_EMANDATES')
  );

  const eMandates = (eMandatesApiResponse?.content ?? []).map((eMandate) => {
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
    };
  });

  const statusNotificationStorage = useEmandateStatusPendingStorage(eMandates);

  const eMandates_ = eMandates.map((eMandate) => {
    return {
      ...eMandate,
      displayStatus: statusNotificationStorage.isPendingActivation(
        eMandate.creditorIBAN
      )
        ? 'Wachten op activatie'
        : eMandate.displayStatus,
    };
  });

  const title = 'E-Mandaat';
  const breadcrumbs = [
    ...useThemaBreadcrumbs(themaId),
    { to: routeConfig.betaalVoorkeuren.path, title: betaalVoorkeurenTitle },
  ];
  const { id } = useParams<{ id: AfisEMandateFrontend['id'] }>();
  const eMandate = eMandates_.find((mandate) => mandate.id === id);

  return {
    breadcrumbs,
    eMandate,
    eMandates: eMandates_,
    eMandateTableConfig,
    hasEMandatesError: !isError,
    isLoadingEMandates: isLoading || !eMandatesApiResponse,
    updateEmandate: (...rest: any) => {
      console.log('updateEmandate', ...rest);
    },
    statusNotification: statusNotificationStorage,
    title,
  };
}

export function useEmandateApis(eMandate: AfisEMandateFrontend) {
  const { updateEmandate, statusNotification } = useAfisEMandatesData();

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

  const statusChangeApi = useDataApiV2<AfisEMandateStatusChangeResponse>(
    eMandate.statusChangeUrl,
    {
      postpone: true,
      fetcher: async (url) => {
        return sendGetRequest<AfisEMandateStatusChangeResponse>(url).then(
          (eMandateUpdatePayload) => {
            if (eMandate && eMandateUpdatePayload) {
              updateEmandate(
                optimisticEmandatesUpdate(eMandate, eMandateUpdatePayload),
                {
                  revalidate: false,
                }
              );
            }
            return eMandateUpdatePayload;
          }
        );
      },
    }
  );

  const { businessPartnerIdEncrypted } = useAfisThemaData();

  const eMandateUpdateApi = useAfisEmandateUpdate(
    businessPartnerIdEncrypted,
    eMandate
  );

  type ApiName = 'redirectUrlApi' | 'statusChangeApi' | 'updateApi';

  const [showError, setShowError] = useState(false);
  const [lastActiveApi, setLastActiveApi] = useState<ApiName | null>(null);

  useEffect(() => {
    entries({
      redirectUrlApi: redirectUrlApi.isLoading,
      statusChangeApi: statusChangeApi.isLoading,
      updateApi: eMandateUpdateApi.isUpdating,
    }).forEach(([apiName, isLoading]) => {
      if (isLoading) {
        setLastActiveApi(apiName);
      }
    });
  }, [
    redirectUrlApi.isLoading,
    statusChangeApi.isLoading,
    eMandateUpdateApi.isUpdating,
  ]);

  const isErrorVisible =
    showError &&
    !redirectUrlApi.isLoading &&
    !statusChangeApi.isLoading &&
    !eMandateUpdateApi.isUpdating &&
    (redirectUrlApi.isError ||
      statusChangeApi.isError ||
      !!eMandateUpdateApi.isError);

  useEffect(() => {
    entries({
      redirectUrlApi: redirectUrlApi.isError,
      statusChangeApi: statusChangeApi.isError,
      updateApi: !!eMandateUpdateApi.isError,
    }).forEach(([apiName, isError]) => {
      if (apiName === lastActiveApi && isError) {
        setShowError(true);
      }
    });
  }, [
    redirectUrlApi.isError,
    statusChangeApi.isError,
    lastActiveApi,
    eMandateUpdateApi.isError,
  ]);

  return {
    redirectUrlApi,
    statusChangeApi,
    eMandateUpdateApi,
    isErrorVisible,
    lastActiveApi,
    hideError: () => {
      setShowError(false);
    },
    statusNotification,
  };
}

export function useAfisBetaalVoorkeurenData(
  businessPartnerIdEncrypted:
    | AfisThemaResponse['businessPartnerIdEncrypted']
    | undefined
) {
  const api = useBffApi<AfisBusinessPartnerDetailsTransformed>(
    businessPartnerIdEncrypted
      ? `${BFFApiUrls.AFIS_BUSINESSPARTNER}?id=${businessPartnerIdEncrypted}`
      : null
  );
  const businesspartnerDetailsApiResponse = api.data;

  return {
    title: 'Betaalvoorkeuren',
    businesspartnerDetails: businesspartnerDetailsApiResponse?.content,
    businessPartnerDetailsLabels,
    isLoadingBusinessPartnerDetails: api.isLoading,
    hasBusinessPartnerDetailsError: api.isError,
    hasEmandatesError: false,
    hasFailedEmailDependency: hasFailedDependency(
      businesspartnerDetailsApiResponse,
      'email'
    ),
    hasFailedPhoneDependency: hasFailedDependency(
      businesspartnerDetailsApiResponse,
      'phone'
    ),
    hasFailedFullNameDependency: hasFailedDependency(
      businesspartnerDetailsApiResponse,
      'fullName'
    ),
    eMandateTableConfig,
    eMandates: [],
    isLoadingEmandates: false,
  };
}

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

export function useEmandateStatusPendingStorage(
  eMandates?: AfisEMandateFrontend[]
) {
  const queryParams = new URLSearchParams(window.location.search);
  const iban = queryParams.get('iban');

  const pendingStorage = useIsPendingNotification();
  const { ibansPendingActivation, setIsPendingActivation } = pendingStorage;
  const navigate = useNavigate();

  useEffect(() => {
    if (!eMandates || eMandates.length === 0) {
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
