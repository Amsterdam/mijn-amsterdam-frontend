import { ApiResponse, apiSuccessResult } from '../../../universal/helpers/api';
import { GenericDocument, ZaakDetail } from '../../../universal/types';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { fetchAanvragen } from '../zorgned/zorgned-service';
import { ProductSoortCode } from '../zorgned/zorgned-types';

// RP TODO: Check this type with actual data, maybe we can reuse the WMOVoorzieningFrontend?
export interface LeerlingenvervoerVoorzieningFrontend extends ZaakDetail {
  dateDecision: string;
  dateDecisionFormatted: string;
  decision: string;
  documents: GenericDocument[];
  isActual: boolean; // Indicates if this item is designated Current or Previous
  itemTypeCode: ProductSoortCode;
  status: string;
  statusDate: string;
  statusDateFormatted: string;
  supplier: string | null; // Leverancier
  disclaimer?: string;
}

export async function fetchJeugd(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<{ isKnown: boolean }>> {
  const aanvragenResponse = await fetchAanvragen(
    requestID,
    authProfileAndToken,
    {
      zorgnedApiConfigKey: 'ZORGNED_LEERLINGENVERVOER',
    }
  );

  if (aanvragenResponse.status !== 'OK') {
    return apiSuccessResult({
      isKnown: false,
      voorzieningen: aanvragenResponse,
    });
  }

  return apiSuccessResult({ isKnown: true, voorzieningen: aanvragenResponse });
}
