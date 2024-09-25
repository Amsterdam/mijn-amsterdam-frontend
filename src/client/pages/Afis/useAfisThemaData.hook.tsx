import { ReactNode, useEffect, useMemo } from 'react';
import {
  AfisBusinessPartnerDetailsTransformed,
  AfisBusinessPartnerKnownResponse,
  AfisFacturenByStateResponse,
  AfisFactuur,
  AfisFactuurState,
} from '../../../server/services/afis/afis-types';
import {
  ApiResponse,
  hasFailedDependency,
  isError,
  isLoading,
  isOk,
} from '../../../universal/helpers/api';
import { capitalizeFirstLetter } from '../../../universal/helpers/text';
import { entries } from '../../../universal/helpers/utils';
import { DocumentLink } from '../../components/DocumentList/DocumentLink';
import { MaLink } from '../../components/MaLink/MaLink';
import { BFFApiUrls } from '../../config/api';
import { BagThemas } from '../../config/thema';
import {
  useAppStateBagApi,
  useAppStateGetter,
  useGetAppStateBagDataByKey,
} from '../../hooks/useAppState';
import {
  AfisFacturenByStateFrontend,
  businessPartnerDetailsLabels,
  eMandateTableConfig,
  facturenTableConfig,
  listPageTitle,
  routes,
} from './Afis-thema-config';

const AFIS_OVERVIEW_STATE_KEY = 'afis-facturen-overzicht';

function getInvoiceStatusDescriptionFrontend(factuur: AfisFactuur): ReactNode {
  switch (factuur.status) {
    case 'openstaand':
      return (
        <>
          {capitalizeFirstLetter(factuur.status)}:{' '}
          <MaLink
            maVariant="fatNoUnderline"
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

function mapFactuur(factuur: AfisFactuur) {
  return {
    ...factuur,
    statusDescription: getInvoiceStatusDescriptionFrontend(factuur),
    factuurNummerEl: factuur.documentDownloadLink ? (
      <DocumentLink
        document={{
          id: factuur.factuurNummer,
          datePublished: factuur.datePublished ?? '',
          url: factuur.documentDownloadLink,
          title: `factuur ${factuur.factuurNummer}`,
        }}
      />
    ) : (
      factuur.factuurNummer
    ),
  };
}

function useTransformFacturen(
  facturenByStateApiResponse: ApiResponse<AfisFacturenByStateResponse | null>
): ApiResponse<AfisFacturenByStateFrontend | null> {
  const facturenByStateTransfomed: AfisFacturenByStateFrontend | null =
    useMemo(() => {
      if (facturenByStateApiResponse.content) {
        return Object.fromEntries(
          entries(facturenByStateApiResponse.content)
            .filter(([state, facturenResponse]) => facturenResponse !== null)
            .map(([state, facturenResponse]) => [
              state,
              {
                ...facturenResponse,
                facturen: facturenResponse?.facturen?.map(mapFactuur) ?? [],
              },
            ])
        );
      }
      return null;
    }, [facturenByStateApiResponse]);

  return Object.assign({}, facturenByStateApiResponse, {
    content: facturenByStateTransfomed,
  });
}

function useAfisOverviewApi(
  businessPartnerIdEncrypted:
    | AfisBusinessPartnerKnownResponse['businessPartnerIdEncrypted']
    | undefined
) {
  const [facturenApiResponse, fetchFacturen, isApiDataCached] =
    useAppStateBagApi<AfisFacturenByStateResponse>({
      bagThema: BagThemas.AFIS,
      key: AFIS_OVERVIEW_STATE_KEY,
    });

  useEffect(() => {
    if (businessPartnerIdEncrypted && !isApiDataCached) {
      fetchFacturen({
        url: `${BFFApiUrls.AFIS_FACTUREN_OVERZICHT}/${businessPartnerIdEncrypted}`,
      });
    }
  }, [businessPartnerIdEncrypted, fetchFacturen, isApiDataCached]);

  const facturenByStateApiResponseUpdated =
    useTransformFacturen(facturenApiResponse);

  return [
    facturenByStateApiResponseUpdated,
    fetchFacturen,
    isApiDataCached,
  ] as const;
}

/**
 * Fetches facturen by state. If open facturen (on thema pagina) are already loaded, use those, all open facturen are loaded initially
 * because we consider those most important and want no additional fetching when navigatinng from Themapagina to Listpage.
 * Otherwise fetch all open facturen from api.
 */
function useAfisListpageApi(
  businessPartnerIdEncrypted:
    | AfisBusinessPartnerKnownResponse['businessPartnerIdEncrypted']
    | undefined,
  state: AfisFactuurState
) {
  const [facturenByStateApiResponse, fetchFacturen, isApiDataCached] =
    useAppStateBagApi<AfisFacturenByStateResponse>({
      bagThema: BagThemas.AFIS,
      key: `afis-facturen-${state}`,
    });

  // Check if we already loaded the open facturen from the overview api
  const facturenByStateApiResponseOpen = useGetAppStateBagDataByKey<
    Pick<AfisFacturenByStateResponse, 'open'>
  >({ bagThema: BagThemas.AFIS, key: AFIS_OVERVIEW_STATE_KEY });

  const hasFacturenByStateOpen = !!facturenByStateApiResponseOpen?.content;

  useEffect(() => {
    if (businessPartnerIdEncrypted && !isApiDataCached && state !== 'open') {
      fetchFacturen({
        url: `${BFFApiUrls.AFIS_FACTUREN}/${state}/${businessPartnerIdEncrypted}`,
      });
    }
  }, [
    businessPartnerIdEncrypted,
    fetchFacturen,
    isApiDataCached,
    state,
    hasFacturenByStateOpen,
  ]);

  const facturenByStateApiResponseUpdated = useTransformFacturen(
    state === 'open' && hasFacturenByStateOpen
      ? facturenByStateApiResponseOpen
      : facturenByStateApiResponse
  );

  return [
    facturenByStateApiResponseUpdated,
    fetchFacturen,
    isApiDataCached,
  ] as const;
}

export function useAfisListPageData(state: AfisFactuurState) {
  const { AFIS } = useAppStateGetter();
  const businessPartnerIdEncrypted =
    AFIS.content?.businessPartnerIdEncrypted ?? null;

  const [facturenByStateApiResponse] = useAfisListpageApi(
    businessPartnerIdEncrypted,
    state
  );

  return {
    facturenListResponse: facturenByStateApiResponse.content?.[state] ?? null,
    facturenTableConfig,
    isThemaPaginaError: isError(AFIS, false),
    isThemaPaginaLoading: isLoading(AFIS),
    isListPageError: isError(facturenByStateApiResponse, false),
    isListPageLoading: isLoading(facturenByStateApiResponse),
    listPageTitle,
    routes,
  };
}

export function useAfisThemaData() {
  const { AFIS } = useAppStateGetter();
  const businessPartnerIdEncrypted =
    AFIS.content?.businessPartnerIdEncrypted ?? null;

  const [facturenByStateApiResponse] = useAfisOverviewApi(
    businessPartnerIdEncrypted
  );

  return {
    businessPartnerIdEncrypted,
    facturenByState: facturenByStateApiResponse.content,
    facturenTableConfig,
    isThemaPaginaError: isError(AFIS, false),
    isThemaPaginaLoading: isLoading(AFIS),
    listPageTitle,
    routes,
    isOverviewApiError: isError(facturenByStateApiResponse),
    isOverviewApiLoading: isLoading(facturenByStateApiResponse),
    dependencyErrors: {
      open: hasFailedDependency(facturenByStateApiResponse, 'open'),
      afgehandeld: hasFailedDependency(
        facturenByStateApiResponse,
        'afgehandeld'
      ),
      overgedragen: hasFailedDependency(
        facturenByStateApiResponse,
        'overgedragen'
      ),
    },
  };
}

export function useAfisBetaalVoorkeurenData(
  businessPartnerIdEncrypted:
    | AfisBusinessPartnerKnownResponse['businessPartnerIdEncrypted']
    | undefined
) {
  const [
    businesspartnerDetailsApiResponse,
    fetchBusinessPartner,
    isApiDataCached,
  ] = useAppStateBagApi<AfisBusinessPartnerDetailsTransformed | null>({
    bagThema: BagThemas.AFIS,
    key: `afis-betaalvoorkeuren`,
  });

  useEffect(() => {
    if (businessPartnerIdEncrypted && !isApiDataCached) {
      fetchBusinessPartner({
        url: `${BFFApiUrls.AFIS_BUSINESSPARTNER}/${businessPartnerIdEncrypted}`,
      });
    }
  }, [businessPartnerIdEncrypted, fetchBusinessPartner, isApiDataCached]);

  return {
    businesspartnerDetails: businesspartnerDetailsApiResponse.content,
    businessPartnerDetailsLabels,
    isLoadingBusinessPartnerDetails: isLoading(
      businesspartnerDetailsApiResponse
    ),
    hasBusinessPartnerDetailsError: isError(
      businesspartnerDetailsApiResponse,
      false
    ),
    hasEmandatesError: false,
    hasFailedEmailDependency: hasFailedDependency(
      businesspartnerDetailsApiResponse,
      'email'
    ),
    hasFailedPhoneDependency: hasFailedDependency(
      businesspartnerDetailsApiResponse,
      'phone'
    ),
    eMandateTableConfig,
    eMandates: [],
    isLoadingEmandates: false,
  };
}
