import { useMemo } from 'react';

import { Paragraph } from '@amsterdam/design-system-react';
import { useParams } from 'react-router';

import type { AfisEMandateFrontend } from '../../../../../../server/services/afis/afis-types.ts';
import { MaRouterLink } from '../../../../../components/MaLink/MaLink.tsx';
import { useBffApi } from '../../../../../hooks/api/useBffApi.ts';
import { useSmallScreen } from '../../../../../hooks/media.hook.ts';
import { useThemaBreadcrumbs } from '../../../../../hooks/useThemaBreadcrumbs.ts';
import { generateApiUrl } from './Afis-helpers.ts';
import {
  eMandateTableConfig,
  getAfisAccountRoutePath,
  themaConfig,
  titleBetaalvoorkeurenPage,
  titleEMandaatPage,
} from './Afis-thema-config.ts';
import {
  CheckStatus,
  useSignRequestPayloadStorageCleanup,
} from './useAfisEMandatesSignRequest.tsx';
import { useAfisThemaData } from './useAfisThemaData.hook.tsx';

function mergePayloadIntoEmandateById(
  id: AfisEMandateFrontend['id'],
  payload: Partial<AfisEMandateFrontend>,
  eMandates: AfisEMandateFrontend[] | undefined
): AfisEMandateFrontend[] {
  if (!eMandates) {
    return [];
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

export function useAfisEMandatesApi() {
  const isSmallScreen = useSmallScreen();

  const {
    businessPartnerIdEncrypted,
    businessPartnerId,
    themaId,
    isThemaPaginaLoading,
    isThemaPaginaError,
    accountRoutePath,
  } = useAfisThemaData();

  const {
    isError,
    isDirty,
    isLoading,
    data: eMandatesApiResponse,
    fetch,
    optimisticUpdateContent,
  } = useBffApi<AfisEMandateFrontend[]>(
    generateApiUrl(businessPartnerIdEncrypted, 'AFIS_EMANDATES'),
    {
      fetchImmediately: themaConfig.featureToggle.emandates.active,
    }
  );

  const EMandatesSource = useMemo(
    () => eMandatesApiResponse?.content ?? [],
    [eMandatesApiResponse?.content]
  );

  useSignRequestPayloadStorageCleanup(EMandatesSource, businessPartnerId);

  const eMandates = EMandatesSource.map((eMandate) => {
    return {
      ...eMandate,
      link: {
        ...eMandate.link,
        to:
          accountRoutePath && businessPartnerId
            ? getAfisAccountRoutePath(eMandate.link.to, businessPartnerId)
            : eMandate.link.to,
      },
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
      displayStatusEl: <CheckStatus eMandate={eMandate} />,
    };
  });

  const breadcrumbs = [
    ...useThemaBreadcrumbs(themaId).map((breadcrumb) =>
      accountRoutePath && breadcrumb.to === themaConfig.route.path
        ? { ...breadcrumb, to: accountRoutePath }
        : breadcrumb
    ),
    {
      to:
        accountRoutePath && businessPartnerId
          ? getAfisAccountRoutePath(
              themaConfig.detailPageBetaalvoorkeuren.route.path,
              businessPartnerId
            )
          : themaConfig.detailPageBetaalvoorkeuren.route.path,
      title: titleBetaalvoorkeurenPage,
    },
  ];
  const { id } = useParams<{
    id: AfisEMandateFrontend['id'];
  }>();
  const eMandate = eMandates.find((mandate) => mandate.id === id);

  return {
    themaId,
    breadcrumbs,
    eMandate,
    eMandates,
    eMandateTableConfig,
    hasEMandatesError: isError,
    isThemaPaginaError,
    isLoadingEMandates: isThemaPaginaLoading || (!isDirty && isLoading), // Show loading only on first load.
    optimisticUpdateContent: (
      eMandateId: string,
      payload: Partial<AfisEMandateFrontend>
    ) => {
      optimisticUpdateContent(
        mergePayloadIntoEmandateById(eMandateId, payload, eMandates)
      );
    },
    title: `${titleEMandaatPage}${eMandate?.creditorName ? ` - ${eMandate.creditorName}` : ''}`,
    fetchEMandates: () => {
      fetch();
    },
  };
}

export const forTesting = {
  updateEmandateById: mergePayloadIntoEmandateById,
};
