import { useEffect } from 'react';
import {
  AfisBusinessPartnerDetailsTransformed,
  AfisBusinessPartnerKnownResponse,
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
  AfisFactuurStub,
  eMandateTableConfig,
  facturenTableConfig,
  listPageParamKind,
  listPageTitle,
  routes,
} from './Afis-thema-config';

export function useAfisThemaData() {
  const { AFIS } = useAppStateGetter();
  const businessPartnerIdEncrypted = AFIS.content?.businessPartnerIdEncrypted;

  const [facturen = [], facturenApi, fetchBusinessPartner] = useAppStateBagApi<
    AfisFactuurStub[] | null
  >({
    bagThema: BagThemas.AFIS,
    key: `${businessPartnerIdEncrypted}-facturen`,
  });

  useEffect(() => {
    if (businessPartnerIdEncrypted) {
      // fetchBusinessPartner({
      //   url: `${BFFApiUrls.AFIS_FACTUREN}/${businessPartnerIdEncrypted}`,
      // });
    }
  }, [businessPartnerIdEncrypted, fetchBusinessPartner]);

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
    facturen: facturen ?? [],
  };
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
