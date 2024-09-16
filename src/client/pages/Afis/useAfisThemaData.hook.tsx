import { ReactNode, useEffect, useMemo } from 'react';
import {
  AfisBusinessPartnerDetailsTransformed,
  AfisBusinessPartnerKnownResponse,
  AfisFactuur,
} from '../../../server/services/afis/afis-types';
import {
  hasFailedDependency,
  isError,
  isLoading,
} from '../../../universal/helpers/api';
import { DisplayProps } from '../../components/Table/TableV2';
import { BFFApiUrls } from '../../config/api';
import { BagThemas } from '../../config/thema';
import { useAppStateBagApi, useAppStateGetter } from '../../hooks/useAppState';
import {
  eMandateTableConfig,
  facturenTableConfig,
  ListPageParamKind,
  listPageParamKind,
  listPageTitle,
  routes,
} from './Afis-thema-config';
import { MaRouterLink } from '../../components/MaLink/MaLink';

import { DocumentLink } from '../../components/DocumentList/DocumentLink';
import { capitalizeFirstLetter } from '../../../universal/helpers/text';
import { GenericDocument } from '../../../universal/types';

export function useAfisThemaData(kind?: ListPageParamKind) {
  const { AFIS } = useAppStateGetter();
  const businessPartnerIdEncrypted = AFIS.content?.businessPartnerIdEncrypted;
  const [facturen, facturenApi, fetchFacturen] = useAppStateBagApi<
    { [key in ListPageParamKind]: AfisFactuur[] } | AfisFactuur[] | null
  >({
    bagThema: kind ? BagThemas.AFIS : BagThemas.AFIS_OVERZICHT,
    key: `${businessPartnerIdEncrypted}-facturen`,
  });

  useEffect(() => {
    if (businessPartnerIdEncrypted) {
      const url = kind
        ? `${BFFApiUrls.AFIS_FACTUREN}/${kind}/${businessPartnerIdEncrypted}`
        : `${BFFApiUrls.AFIS_FACTUREN_OVERZICHT}/${businessPartnerIdEncrypted}`;
      fetchFacturen({ url });
    }
  }, [businessPartnerIdEncrypted, fetchFacturen, kind]);

  const updatedFacturen = useMemo(() => {
    return kind
      ? Array.isArray(facturen)
        ? (facturen as AfisFactuur[])?.map(mapFactuur)
        : []
      : facturen && Object.keys(facturen).length > 0
        ? Object.fromEntries(
            Object.entries(facturen).map(([key, value]) => [
              key,
              value.map(mapFactuur),
            ])
          )
        : { open: [], closed: [] };
  }, [facturen, kind]);

  return {
    businessPartnerIdEncrypted:
      AFIS.content?.businessPartnerIdEncrypted ?? null,
    isThemaPaginaLoading: isLoading(AFIS),
    isThemaPaginaError: isError(AFIS, false),
    routes,
    facturenTableConfig,
    listPageTitle,
    listPageParamKind,
    isFacturenError: facturenApi.isError,
    isFacturenLoading: facturenApi.isLoading,
    facturen: updatedFacturen,
  };
}

function mapFactuur(factuur: AfisFactuur) {
  return {
    ...factuur,
    status: getInvoiceStatusDescription(factuur),
    factuurNummer: factuur.documentDownloadLink ? (
      <DocumentLink
        document={toGenericDocument(
          factuur.documentDownloadLink,
          `factuur ${factuur.factuurNummer}`
        )}
      />
    ) : (
      factuur.factuurNummer
    ),
  };
}

function toGenericDocument(
  document: GenericDocument | string,
  title: string
): GenericDocument {
  if (typeof document === 'string') {
    return {
      id: document,
      url: document,
      title,
      datePublished: new Date().toISOString(),
    };
  }
  return document;
}

const businessPartnerDetailsLabels: DisplayProps<AfisBusinessPartnerDetailsTransformed> =
  {
    fullName: 'Debiteurnaam',
    businessPartnerId: 'Debiteurnummer',
    email: 'E-mailadres factuur',
    phone: 'Telefoonnummer',
  };

export function useAfisBetaalVoorkeurenData(
  businessPartnerIdEncrypted: AfisBusinessPartnerKnownResponse['businessPartnerIdEncrypted']
) {
  const [
    businesspartnerDetails,
    businesspartnerDetailsApi,
    fetchBusinessPartner,
  ] = useAppStateBagApi<AfisBusinessPartnerDetailsTransformed | null>({
    bagThema: BagThemas.AFIS,
    key: `${businessPartnerIdEncrypted}-betaalvoorkeuren`,
  });

  useEffect(() => {
    if (businessPartnerIdEncrypted) {
      fetchBusinessPartner({
        url: `${BFFApiUrls.AFIS_BUSINESSPARTNER}/${businessPartnerIdEncrypted}`,
      });
    }
  }, [businessPartnerIdEncrypted, fetchBusinessPartner]);

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
          Openstaand:{' '}
          <MaRouterLink maVariant="fatNoUnderline" href={factuur.paylink ?? ''}>
            {factuur.amountOwedFormatted} betaal nu
          </MaRouterLink>
        </>
      );
    case 'in-dispuut':
      return 'In dispuut';
    case 'automatische-incasso':
      return (
        <>
          {factuur.amountOwedFormatted} wordt automatisch van uw <br />
          rekening afgeschreven
        </>
      );
    default:
      return capitalizeFirstLetter(factuur.status ?? '');
  }
}
