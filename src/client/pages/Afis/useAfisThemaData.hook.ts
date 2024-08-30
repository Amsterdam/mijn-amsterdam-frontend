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
  eMandateTableConfig,
  facturenTableConfig,
  listPageParamKind,
  listPageTitle,
  routes,
} from './Afis-thema-config';

export function useAfisThemaData() {
  const { AFIS } = useAppStateGetter();

  return {
    businessPartnerIdEncrypted: AFIS.content?.businessPartnerIdEncrypted,
    isThemaPaginaLoading: isLoading(AFIS),
    isThemaPaginaError: isError(AFIS, false),
    isThemaPaginaPartialError: false, // TODO: Implement when we can use the /api/v1/services/afis/facturen/:kind endpoint
    routes,
    facturenTableConfig,
    listPageTitle,
    listPageParamKind,
  };
}

const businessPartnerDetailsLabels: DisplayProps<AfisBusinessPartnerDetailsTransformed> =
  {
    businessPartnerId: 'Debiteurnummer',
    fullName: 'Debiteurnaam',
    address: 'Adres',
    email: 'E-mailadres factuur',
    phone: 'Telefoonnummer',
  };

export function useAfisBetaalVoorkeurenData(
  businessPartnerIdEncrypted: AfisBusinessPartnerKnownResponse['businessPartnerIdEncrypted']
) {
  const [businesspartnerDetails, businesspartnerDetailsApi] =
    useAppStateBagApi<AfisBusinessPartnerDetailsTransformed | null>({
      url: `${BFFApiUrls.AFIS_BUSINESSPARTNER}/${businessPartnerIdEncrypted}`,
      bagThema: BagThemas.AFIS,
      key: `${businessPartnerIdEncrypted}-betaalvoorkeuren`,
    });

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
  };
}
