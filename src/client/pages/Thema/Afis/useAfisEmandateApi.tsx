import { useState, useEffect } from 'react';

import { Paragraph } from '@amsterdam/design-system-react';
import isEqual from 'lodash.isequal';
import { useNavigate, useParams } from 'react-router';

import {
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

export function updateEmandateById(
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
  const { title: betaalVoorkeurenTitle } = useAfisBetaalVoorkeurenData(
    businessPartnerIdEncrypted
  );

  const {
    isLoading,
    isError,
    isDirty,
    data: eMandatesApiResponse,
    fetch,
    optimisticUpdateContent,
  } = useBffApi<AfisEMandateFrontend[]>(
    generateApiUrl(businessPartnerIdEncrypted, 'AFIS_EMANDATES')
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

  const title = 'E-Mandaat';
  const breadcrumbs = [
    ...useThemaBreadcrumbs(themaId),
    { to: routeConfig.betaalVoorkeuren.path, title: betaalVoorkeurenTitle },
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
    title,
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
    businesspartnerDetails: businesspartnerDetailsApiResponse?.content ?? null,
    businessPartnerDetailsLabels,
    isLoadingBusinessPartnerDetails: api.isLoading,
    hasBusinessPartnerDetailsError: api.isError,
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
