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
  AfisThemaResponse,
  AfisFacturenByStateResponse,
  AfisFactuur,
  AfisFactuurState,
} from '../../../server/services/afis/afis-types';
import {
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
  facturenByState: AfisFacturenByStateResponse | null
): AfisFacturenByStateFrontend | null {
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
                facturen: facturenResponse?.facturen?.map(mapFactuur) ?? [],
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
  state?: AfisFactuurState
) {
  const [facturenByStateApiResponse, fetchFacturen, isApiDataCached] =
    useAppStateBagApi<AfisThemaResponse['facturen']>({
      bagThema: BagThemas.AFIS,
      key: `afis-facturen-${state}`,
    });

  useEffect(() => {
    if (
      businessPartnerIdEncrypted &&
      !isApiDataCached &&
      state &&
      state !== 'open'
    ) {
      fetchFacturen({
        url: `${BFFApiUrls.AFIS_FACTUREN}/${state}?id=${businessPartnerIdEncrypted}`,
      });
    }
  }, [businessPartnerIdEncrypted, fetchFacturen, isApiDataCached, state]);

  const facturenByStateApiUpdated = useTransformFacturen(
    facturenByStateApiResponse.content ?? null
  );

  return [
    facturenByStateApiUpdated,
    facturenByStateApiResponse,
    fetchFacturen,
    isApiDataCached,
  ] as const;
}

export function useAfisListPageData(state: AfisFactuurState) {
  const { AFIS } = useAppStateGetter();
  const businessPartnerIdEncrypted =
    AFIS.content?.businessPartnerIdEncrypted ?? null;

  const [facturenByStateFromBAGState, facturenByStateApiResponse] =
    useAfisFacturenApi(businessPartnerIdEncrypted, state);

  const facturenByStateFromMainState = useTransformFacturen(
    AFIS.content?.facturen ?? null
  );

  return {
    facturenListResponse:
      (state === 'open'
        ? facturenByStateFromMainState?.open
        : facturenByStateFromBAGState?.[state]) ?? null,
    facturenTableConfig,
    isThemaPaginaError: isError(AFIS, false),
    isThemaPaginaLoading: isLoading(AFIS),
    isListPageError:
      state !== 'open' ? isError(facturenByStateApiResponse, false) : false,
    isListPageLoading:
      state !== 'open' ? isLoading(facturenByStateApiResponse) : false,
    listPageTitle,
    routes,
  };
}

export function useAfisThemaData() {
  const { AFIS } = useAppStateGetter();
  const businessPartnerIdEncrypted =
    AFIS.content?.businessPartnerIdEncrypted ?? null;

  const facturenByState = useTransformFacturen(AFIS.content?.facturen ?? null);

  return {
    businessPartnerIdEncrypted,
    facturenByState,
    facturenTableConfig,
    isThemaPaginaError: isError(AFIS, false),
    isThemaPaginaLoading: isLoading(AFIS),
    listPageTitle,
    routes,
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
        url: `${BFFApiUrls.AFIS_BUSINESSPARTNER}?id=${businessPartnerIdEncrypted}`,
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
