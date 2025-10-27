import { generateApiUrl } from './Afis-helpers';
import { businessPartnerDetailsLabels } from './Afis-thema-config';
import type {
  AfisThemaResponse,
  AfisBusinessPartnerDetailsTransformed,
} from '../../../../server/services/afis/afis-types';
import { hasFailedDependency } from '../../../../universal/helpers/api';
import { useBffApi } from '../../../hooks/api/useBffApi';

export function useAfisBetaalVoorkeurenData(
  businessPartnerIdEncrypted:
    | AfisThemaResponse['businessPartnerIdEncrypted']
    | undefined
) {
  const api = useBffApi<AfisBusinessPartnerDetailsTransformed>(
    businessPartnerIdEncrypted
      ? generateApiUrl(businessPartnerIdEncrypted, 'AFIS_BUSINESSPARTNER')
      : null
  );
  const businesspartnerDetailsApiResponse = api.data;

  return {
    title: 'Betaalvoorkeuren',
    businesspartnerDetails: businesspartnerDetailsApiResponse?.content ?? null,
    businessPartnerDetailsLabels,
    isLoadingBusinessPartnerDetails: api.isLoading,
    hasBusinessPartnerDetailsError: api.isError,
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
  };
}
