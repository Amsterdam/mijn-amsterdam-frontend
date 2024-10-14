import { ReactNode, useEffect, useMemo } from 'react';

import {
  AfisFacturenByStateFrontend,
  businessPartnerDetailsLabels,
  eMandateTableConfig,
  facturenTableConfig,
  listPageTitle,
  routes,
} from './Afis-thema-config';
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
} from '../../../universal/helpers/api';
import { capitalizeFirstLetter } from '../../../universal/helpers/text';
import { entries } from '../../../universal/helpers/utils';
import { DocumentLink } from '../../components/DocumentList/DocumentLink';
import { MaLink } from '../../components/MaLink/MaLink';
import { BFFApiUrls } from '../../config/api';
import { BagThemas } from '../../config/thema';
import { useAppStateBagApi, useAppStateGetter } from '../../hooks/useAppState';

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

/**
 * Uses /overview endpoint for Open and Overview facturen (All the Open facuren are loaded with this endpoint)
 * Uses /facturen/(afgehandeld|overgedragen) for the facturen with this state.
 */
function useAfisFacturenApi(
  businessPartnerIdEncrypted:
    | AfisBusinessPartnerKnownResponse['businessPartnerIdEncrypted']
    | undefined,
  state?: AfisFactuurState
) {
  const isOpenfacturenState = !state || state === 'open';

  const [facturenByStateApiResponse, fetchFacturen, isApiDataCached] =
    useAppStateBagApi<AfisFacturenByStateResponse>({
      bagThema: BagThemas.AFIS,
      key: isOpenfacturenState
        ? AFIS_OVERVIEW_STATE_KEY
        : `afis-facturen-${state}`,
    });

  useEffect(() => {
    if (businessPartnerIdEncrypted && !isApiDataCached) {
      let url = `${BFFApiUrls.AFIS_FACTUREN}/${state}/${businessPartnerIdEncrypted}`;
      if (isOpenfacturenState) {
        url = `${BFFApiUrls.AFIS_FACTUREN_OVERZICHT}/${businessPartnerIdEncrypted}`;
      }
      fetchFacturen({
        url,
      });
    }
  }, [businessPartnerIdEncrypted, fetchFacturen, isApiDataCached, state]);

  const facturenByStateApiResponseUpdated = useTransformFacturen(
    facturenByStateApiResponse
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

  const [facturenByStateApiResponse] = useAfisFacturenApi(
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

  const [facturenByStateApiResponse] = useAfisFacturenApi(
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
    fetchBusinessPartnerDetails,
    isApiDataCached,
  ] = useAppStateBagApi<AfisBusinessPartnerDetailsTransformed | null>({
    bagThema: BagThemas.AFIS,
    key: `afis-betaalvoorkeuren`,
  });

  useEffect(() => {
    if (businessPartnerIdEncrypted && !isApiDataCached) {
      fetchBusinessPartnerDetails({
        url: `${BFFApiUrls.AFIS_BUSINESSPARTNER}/${businessPartnerIdEncrypted}`,
      });
    }
  }, [
    businessPartnerIdEncrypted,
    fetchBusinessPartnerDetails,
    isApiDataCached,
  ]);

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
    hasFailedFullNameDependency: hasFailedDependency(
      businesspartnerDetailsApiResponse,
      'fullName'
    ),
    eMandateTableConfig,
    eMandates: [],
    isLoadingEmandates: false,
  };
}
