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
import { useAppStateBagApi, useAppStateGetter } from '../../hooks/useAppState';
import {
  AfisFacturenByStateFrontend,
  businessPartnerDetailsLabels,
  eMandateTableConfig,
  facturenTableConfig,
  listPageTitle,
  routes,
} from './Afis-thema-config';

export function useAfisThemaData(state?: AfisFactuurState) {
  const { AFIS } = useAppStateGetter();
  const businessPartnerIdEncrypted = AFIS.content?.businessPartnerIdEncrypted;

  const [facturen, facturenApi, fetchFacturen, isApiDataCached] =
    useAppStateBagApi<AfisFacturenByStateResponse>({
      bagThema: BagThemas.AFIS,
      key: `${businessPartnerIdEncrypted}-facturen-${state ?? 'overzicht'}`,
    });

  useEffect(() => {
    if (businessPartnerIdEncrypted && !isApiDataCached) {
      const url = state
        ? `${BFFApiUrls.AFIS_FACTUREN}/${state}/${businessPartnerIdEncrypted}`
        : `${BFFApiUrls.AFIS_FACTUREN_OVERZICHT}/${businessPartnerIdEncrypted}`;
      fetchFacturen({ url });
    }
  }, [businessPartnerIdEncrypted, fetchFacturen, state, isApiDataCached]);

  const facturenByState: AfisFacturenByStateFrontend = useMemo(() => {
    if (facturen) {
      const entries = Object.entries(facturen);
      return Object.fromEntries(
        entries.map(([state, facturen]) => [state, facturen.map(mapFactuur)])
      );
    }
    return { open: [], closed: [] };
  }, [facturen]);

  return {
    businessPartnerIdEncrypted:
      AFIS.content?.businessPartnerIdEncrypted ?? null,
    isThemaPaginaLoading: isLoading(AFIS),
    isThemaPaginaError: isError(AFIS, false),
    routes,
    facturenTableConfig,
    listPageTitle,
    state,
    isFacturenError: facturenApi.isError,
    isFacturenLoading: facturenApi.isLoading,
    hasFailedFacturenOpenDependency: hasFailedDependency(
      facturenApi.data,
      'open'
    ),
    hasFailedFacturenClosedDependency: hasFailedDependency(
      facturenApi.data,
      'closed'
    ),
    hasFailedFacturenTransferredDependency: hasFailedDependency(
      facturenApi.data,
      'transferred'
    ),
    facturenByState,
  };
}

function mapFactuur(factuur: AfisFactuur) {
  return {
    ...factuur,
    statusDescription: getInvoiceStatusDescription(factuur),
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
    key: `${businessPartnerIdEncrypted}-betaalvoorkeuren`,
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

function getInvoiceStatusDescription(factuur: AfisFactuur): ReactNode {
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
