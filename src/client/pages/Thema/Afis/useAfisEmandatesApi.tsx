import { Paragraph } from '@amsterdam/design-system-react';
import { useParams } from 'react-router';

import { generateApiUrl } from './Afis-helpers';
import {
  routeConfig,
  eMandateTableConfig,
  titleBetaalvoorkeurenPage,
  titleEMandaatPage,
  featureToggle,
} from './Afis-thema-config';
import { CheckStatus } from './useAfisEMandatesSignRequest';
import { useAfisThemaData } from './useAfisThemaData.hook';
import type { AfisEMandateFrontend } from '../../../../server/services/afis/afis-types';
import { MaRouterLink } from '../../../components/MaLink/MaLink';
import { useBffApi } from '../../../hooks/api/useBffApi';
import { useSmallScreen } from '../../../hooks/media.hook';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems';

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

  const { businessPartnerIdEncrypted, themaId } = useAfisThemaData();

  const {
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
      displayStatusEl: <CheckStatus eMandate={eMandate} />,
    };
  });

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
    isLoadingEMandates: !isDirty, // Show loading only on first load.
    optimisticUpdateContent: (
      eMandateId: string,
      payload: Partial<AfisEMandateFrontend>
    ) => {
      optimisticUpdateContent(
        mergePayloadIntoEmandateById(eMandateId, payload, eMandates)
      );
    },
    title: titleEMandaatPage,
    fetchEMandates: () => {
      fetch();
    },
  };
}

export const forTesting = {
  updateEmandateById: mergePayloadIntoEmandateById,
};
