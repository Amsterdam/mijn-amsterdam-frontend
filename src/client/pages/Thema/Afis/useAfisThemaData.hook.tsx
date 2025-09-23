import { ReactNode, useMemo } from 'react';

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
} from './Afis-thema-config';
import {
  AfisBusinessPartnerDetailsTransformed,
  AfisThemaResponse,
  AfisFacturenByStateResponse,
  AfisFactuur,
  AfisFactuurState,
  type AfisFacturenResponse,
} from '../../../../server/services/afis/afis-types';
import {
  hasFailedDependency,
  isError,
  isLoading,
} from '../../../../universal/helpers/api';
import { capitalizeFirstLetter } from '../../../../universal/helpers/text';
import { entries } from '../../../../universal/helpers/utils';
import { LinkProps } from '../../../../universal/types/App.types';
import { DocumentLink } from '../../../components/DocumentList/DocumentLink';
import { MaLink } from '../../../components/MaLink/MaLink';
import { BFFApiUrls } from '../../../config/api';
import { useBffApi } from '../../../hooks/api/useDataApi-v2';
import { useSmallScreen } from '../../../hooks/media.hook';
import { useAppStateGetter } from '../../../hooks/useAppStateRemote';
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

function mapFactuur(factuur: AfisFactuur, isPhoneScreen: boolean) {
  let factuurNummerEl: ReactNode = factuur.factuurNummer;

  if (factuur.documentDownloadLink) {
    factuurNummerEl = (
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

  return {
    ...factuur,
    statusDescription: getInvoiceStatusDescriptionFrontend(factuur),
    factuurNummerEl,
  };
}

function useTransformFacturen(
  facturenByState: AfisFacturenByStateResponse | null
): AfisFacturenByStateFrontend | null {
  const isPhoneScreen = useSmallScreen();
  const facturenByStateTransformed: AfisFacturenByStateFrontend | null =
    useMemo(() => {
      if (facturenByState) {
        return Object.fromEntries(
          entries(facturenByState)
            .filter(([_state, facturenResponse]) => facturenResponse !== null)
            .map(([state, facturenResponse]) => [
              state,
              {
                ...facturenResponse,
                facturen:
                  facturenResponse?.facturen?.map((factuur) =>
                    mapFactuur(factuur, isPhoneScreen)
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
  state: AfisFactuurState
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

export function useAfisListPageData(state: AfisFactuurState) {
  const { AFIS } = useAppStateGetter();
  const businessPartnerIdEncrypted =
    AFIS.content?.businessPartnerIdEncrypted ?? null;

  const api = useAfisFacturenApi(businessPartnerIdEncrypted, state);

  const facturenByStateFromMainState = useTransformFacturen(
    AFIS.content?.facturen ?? null
  );

  const breadcrumbs = useThemaBreadcrumbs(themaId);

  return {
    themaId: themaId,
    facturenListResponse:
      state === 'open'
        ? // Open facturen are always loaded and retrieved from the stream endpoint
          facturenByStateFromMainState?.open
        : (api.facturenByState?.[state] ?? null),
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
    businesspartnerDetails: businesspartnerDetailsApiResponse?.content,
    businessPartnerDetailsLabels,
    isLoadingBusinessPartnerDetails: api.isLoading,
    hasBusinessPartnerDetailsError: api.isError,
    hasEmandatesError: false,
    hasFailedEmailDependency: businesspartnerDetailsApiResponse
      ? hasFailedDependency(businesspartnerDetailsApiResponse, 'email')
      : false,
    hasFailedPhoneDependency: businesspartnerDetailsApiResponse
      ? hasFailedDependency(businesspartnerDetailsApiResponse, 'phone')
      : false,
    hasFailedFullNameDependency: businesspartnerDetailsApiResponse
      ? hasFailedDependency(businesspartnerDetailsApiResponse, 'fullName')
      : false,
    eMandateTableConfig,
    eMandates: [],
    isLoadingEmandates: false,
  };
}
