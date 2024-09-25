import { ReactNode, useEffect, useMemo } from 'react';
import {
  AfisBusinessPartnerDetailsTransformed,
  AfisBusinessPartnerKnownResponse,
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
const AFIS_FACTUREN_RESPONSE = { count: 0, facturen: [] };

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

function useTransformFacturen(
  facturenByState: AfisFacturenByStateResponse,
  state?: AfisFactuurState
) {
  const facturenByStateUpdated: AfisFacturenByStateFrontend = useMemo(() => {
    if (facturenByState) {
      const entries = Object.entries(facturenByState);
      return Object.fromEntries(
        entries
          .filter(([state, facturenResponse]) => facturenResponse !== null)
          .map(([state, facturen]) => [
            state,
            {
              ...facturen,
              facturen: facturen?.facturen.map(mapFactuur) ?? [],
            },
          ])
      );
    }
    return state
      ? { [state]: AFIS_FACTUREN_RESPONSE }
      : {
          open: AFIS_FACTUREN_RESPONSE,
          closed: AFIS_FACTUREN_RESPONSE,
          transferred: AFIS_FACTUREN_RESPONSE,
        };
  }, [facturenByState]);

  return facturenByStateUpdated;
}

function useAfisOverviewApi(
  businessPartnerIdEncrypted?: AfisBusinessPartnerKnownResponse['businessPartnerIdEncrypted']
) {
  const [facturenByState, api, fetchFacturen, isApiDataCached] =
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

  const facturenByStateUpdated = useTransformFacturen(facturenByState);

  return [facturenByStateUpdated, api, fetchFacturen, isApiDataCached] as const;
}

/**
 * Fetches facturen by state. If open facturen (on thema pagina) are already loaded, use those, all open facturen are loaded initially
 * because we consider those most important and want no additional fetching when navigatinng from Themapagina to Listpage.
 * Otherwise fetch all open facturen from api.
 */
function useAfisListpageApi(
  businessPartnerIdEncrypted: AfisBusinessPartnerKnownResponse['businessPartnerIdEncrypted'],
  state: AfisFactuurState
) {
  const [facturenByState, api, fetchFacturen, isApiDataCached] =
    useAppStateBagApi<AfisFacturenByStateResponse>({
      bagThema: BagThemas.AFIS,
      key: `afis-facturen-${state}`,
    });

  const facturenByStateOpen = useGetAppStateBagDataByKey<
    Omit<AfisFacturenByStateResponse, 'afgehandeld' | 'overgedragen'>
  >({ bagThema: BagThemas.AFIS, key: AFIS_OVERVIEW_STATE_KEY });

  const hasFacturenByStateOpen = !!facturenByStateOpen;

  useEffect(() => {
    if (
      businessPartnerIdEncrypted &&
      !isApiDataCached &&
      (state !== 'open' || !hasFacturenByStateOpen)
    ) {
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

  const facturenByStateUpdated = useTransformFacturen(
    state === 'open' && hasFacturenByStateOpen
      ? facturenByStateOpen
      : facturenByState,
    state
  );

  return [facturenByStateUpdated, api, fetchFacturen, isApiDataCached] as const;
}

export function useAfisListPageData(state: AfisFactuurState) {
  const { AFIS } = useAppStateGetter();
  const businessPartnerIdEncrypted =
    AFIS.content?.businessPartnerIdEncrypted ?? null;

  const [facturenByState, api] = useAfisListpageApi(
    businessPartnerIdEncrypted,
    state
  );

  return {
    api,
    facturenResponse: facturenByState[state],
    facturenTableConfig,
    isThemaPaginaError: isError(AFIS, false),
    isThemaPaginaLoading: isLoading(AFIS),
    listPageTitle,
    routes,
  };
}

export function useAfisThemaData() {
  const { AFIS } = useAppStateGetter();
  const businessPartnerIdEncrypted =
    AFIS.content?.businessPartnerIdEncrypted ?? null;

  const [facturenByState, api] = useAfisOverviewApi(businessPartnerIdEncrypted);

  return {
    api,
    businessPartnerIdEncrypted,
    facturenByState,
    facturenTableConfig,
    isThemaPaginaError: isError(AFIS, false),
    isThemaPaginaLoading: isLoading(AFIS),
    listPageTitle,
    routes,
    dependencyErrors: {
      open: hasFailedDependency(api.data, 'open'),
      afgehandeld: hasFailedDependency(api.data, 'afgehandeld'),
      overgedragen: hasFailedDependency(api.data, 'overgedragen'),
    },
  };
}

export function useAfisBetaalVoorkeurenData(
  businessPartnerIdEncrypted: AfisBusinessPartnerKnownResponse['businessPartnerIdEncrypted']
) {
  const [
    businesspartnerDetails,
    businesspartnerDetailsApi,
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
    businesspartnerDetails,
    businessPartnerDetailsLabels,
    isLoadingBusinessPartnerDetails: businesspartnerDetailsApi.isLoading,
    hasBusinessPartnerDetailsError: isError(
      businesspartnerDetailsApi.data,
      false
    ),
    hasEmandatesError: false,
    hasFailedEmailDependency: hasFailedDependency(
      businesspartnerDetailsApi.data,
      'email'
    ),
    hasFailedPhoneDependency: hasFailedDependency(
      businesspartnerDetailsApi.data,
      'phone'
    ),
    eMandateTableConfig,
    eMandates: [],
    isLoadingEmandates: false,
  };
}
