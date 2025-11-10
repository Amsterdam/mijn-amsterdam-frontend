import { ReactNode, useMemo } from 'react';

import { generatePath } from 'react-router';

import {
  AfisFacturenByStateFrontend,
  businessPartnerDetailsLabels,
  eMandateTableConfig,
  facturenTableConfig,
  listPageTitle,
  linkListItems,
  themaTitle,
  themaId,
  routeConfig,
  type AfisFactuurFrontend,
} from './Afis-thema-config';
import {
  AfisBusinessPartnerDetailsTransformed,
  AfisThemaResponse,
  AfisFacturenOverviewResponse,
  AfisFactuur,
  type AfisFactuurStateFrontend,
  type AfisFacturenResponse,
} from '../../../../server/services/afis/afis-types';
import {
  hasFailedDependency,
  isError,
  isLoading,
} from '../../../../universal/helpers/api';
import { capitalizeFirstLetter } from '../../../../universal/helpers/text';
import { entries, omit } from '../../../../universal/helpers/utils';
import { LinkProps } from '../../../../universal/types/App.types';
import { DocumentLink } from '../../../components/DocumentList/DocumentLink';
import { MaLink, MaRouterLink } from '../../../components/MaLink/MaLink';
import { BFFApiUrls } from '../../../config/api';
import { useBffApi } from '../../../hooks/api/useBffApi';
import { useAppStateGetter } from '../../../hooks/useAppStateStore';
import {
  useThemaBreadcrumbs,
  useThemaMenuItemByThemaID,
} from '../../../hooks/useThemaMenuItems';
import {
  BELASTINGEN_ROUTE_DEFAULT,
  themaId as themaIdBelastingen,
} from '../Belastingen/Belastingen-thema-config';

function getInvoiceStatusDescriptionFrontend(factuur: AfisFactuur): ReactNode {
  switch (factuur.status) {
    case 'openstaand':
      return (
        <>
          {capitalizeFirstLetter(factuur.status)}:{' '}
          <MaLink
            maVariant="fatNoUnderline"
            target="_blank"
            href={factuur.paylink ?? '#missing-paylink'}
          >
            {factuur.statusDescription}
          </MaLink>
        </>
      );
    default:
      return factuur.statusDescription;
  }
}

export function getDocumentLink(factuur: AfisFactuurFrontend): ReactNode {
  if (factuur.documentDownloadLink) {
    return (
      <DocumentLink
        document={{
          id: factuur.factuurNummer,
          datePublished: factuur.datePublished ?? '',
          url: factuur.documentDownloadLink,
          title: `factuur ${factuur.factuurNummer}`,
        }}
      />
    );
  }
  return null;
}

function transformFactuur(
  factuur: AfisFactuur,
  state: AfisFactuurStateFrontend
): AfisFactuurFrontend {
  const factuurNummerEl: ReactNode = (
    <MaRouterLink
      maVariant="fatNoDefaultUnderline"
      href={generatePath(routeConfig.detailPage.path, {
        factuurNummer: factuur.factuurNummer,
        state,
      })}
    >
      {factuur.factuurNummer}
    </MaRouterLink>
  );

  return {
    ...factuur,
    statusDescription: getInvoiceStatusDescriptionFrontend(factuur),
    factuurNummerEl,
  };
}

function useTransformFacturen(
  facturenByState: Partial<AfisFacturenOverviewResponse> | null
): AfisFacturenByStateFrontend | null {
  const facturenByStateTransformed: AfisFacturenByStateFrontend | null =
    useMemo(() => {
      if (facturenByState) {
        return Object.fromEntries(
          entries(facturenByState)
            .filter(
              (
                state
              ): state is [AfisFactuurStateFrontend, AfisFacturenResponse] => {
                const [_state, _facturenResponse] = state;
                return _facturenResponse != null;
              }
            )
            .map(([state, facturenResponse]) => [
              state,
              {
                ...omit(facturenResponse, ['facturen']),
                facturen:
                  facturenResponse?.facturen?.map((factuur) =>
                    transformFactuur(factuur, state)
                  ) ?? [],
              },
            ])
        );
      }
      return null;
    }, [facturenByState]);

  return facturenByStateTransformed;
}

/**
 * Uses /overview endpoint for Open and Overview facturen (All the Open facuren are loaded with this endpoint)
 * Uses /facturen/(afgehandeld|overgedragen) for the facturen with this state.
 */
function useAfisFacturenApi(
  businessPartnerIdEncrypted:
    | AfisThemaResponse['businessPartnerIdEncrypted']
    | undefined,
  state: AfisFactuurStateFrontend
) {
  const url =
    businessPartnerIdEncrypted && state && state !== 'open'
      ? `${BFFApiUrls.AFIS_FACTUREN}/${state}?id=${businessPartnerIdEncrypted}`
      : null;

  const { data, isError, isLoading } = useBffApi<AfisFacturenResponse>(url);
  const facturenResponse = data?.content ?? null;
  const facturenByStateApiUpdated = useTransformFacturen(
    facturenResponse
      ? {
          [facturenResponse.state]: facturenResponse,
        }
      : null
  );

  return {
    facturenByState: facturenByStateApiUpdated,
    isLoading,
    isError,
  } as const;
}

export function useAfisListPageData(state: AfisFactuurStateFrontend) {
  const { AFIS } = useAppStateGetter();
  const businessPartnerIdEncrypted =
    AFIS.content?.businessPartnerIdEncrypted ?? null;

  const api = useAfisFacturenApi(businessPartnerIdEncrypted, state);

  const facturenByStateFromMainState = useTransformFacturen(
    AFIS.content?.facturen ?? null
  );

  const breadcrumbs = useThemaBreadcrumbs(themaId);

  // Open facturen are always loaded and retrieved from the stream endpoint
  const openFacturenFromMainState = facturenByStateFromMainState?.open ?? null;
  const facturenByStateFromApi = api.facturenByState?.[state] ?? null;

  return {
    themaId: themaId,
    facturen:
      (state === 'open' ? openFacturenFromMainState : facturenByStateFromApi)
        ?.facturen ?? [],
    facturenTableConfig,
    isThemaPaginaError: isError(AFIS, false),
    isThemaPaginaLoading: isLoading(AFIS),
    isListPageError: state !== 'open' ? api.isError : false,
    isListPageLoading: state !== 'open' ? api.isLoading : false,
    listPageTitle,
    routeConfig,
    breadcrumbs,
  };
}

export function useAfisThemaData() {
  const { AFIS } = useAppStateGetter();
  const businessPartnerIdEncrypted =
    AFIS.content?.businessPartnerIdEncrypted ?? null;

  const facturenByState = useTransformFacturen(AFIS.content?.facturen ?? null);
  const menuItem = useThemaMenuItemByThemaID(themaIdBelastingen);
  const urlNaarBelastingen = menuItem?.to;

  const belastingenLinkListItem: LinkProps = {
    title: 'Belastingen op Mijn Amsterdam',
    to: urlNaarBelastingen || BELASTINGEN_ROUTE_DEFAULT,
  };

  const breadcrumbs = useThemaBreadcrumbs(themaId);

  return {
    themaId: themaId,
    title: themaTitle,
    belastingenLinkListItem,
    businessPartnerIdEncrypted,
    facturenByState,
    facturenTableConfig,
    isThemaPaginaError: isError(AFIS, false),
    isThemaPaginaLoading: isLoading(AFIS),
    listPageTitle,
    linkListItems: [...linkListItems, belastingenLinkListItem],
    routeConfig,
    breadcrumbs,
    dependencyErrors: {
      open: hasFailedDependency(AFIS, 'open'),
      afgehandeld: hasFailedDependency(AFIS, 'afgehandeld'),
      overgedragen: hasFailedDependency(AFIS, 'overgedragen'),
    },
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
