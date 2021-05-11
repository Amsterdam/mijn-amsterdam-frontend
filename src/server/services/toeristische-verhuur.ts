import { FeatureToggle } from '../../universal/config';
import { AppRoutes } from '../../universal/config/routes';
import {
  apiSuccesResult,
  getFailedDependencies,
  getSettledResult,
} from '../../universal/helpers/api';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';
import {
  fetchVergunningen,
  toeristischeVerhuurVergunningTypes,
} from './vergunningen';

export interface ToeristischeVerhuurRegistratie {
  city: string;
  houseLetter: string | null;
  houseNumber: string | null;
  houseNumberExtension: string | null;
  postalCode: string | null;
  registrationNumber: string | null;
  shortName: string | null;
  street: string | null;
}

export interface ToeristischeVerhuurRegistratiesSourceData {
  content: ToeristischeVerhuurRegistratie[];
}

export function transformToeristischeVerhuur(
  responseData: ToeristischeVerhuurRegistratiesSourceData
): ToeristischeVerhuurRegistratie[] | null {
  return responseData.content || [];
}

function fetchRegistraties(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  return requestData<ToeristischeVerhuurRegistratie[]>(
    getApiConfig('TOERISTISCHE_VERHUUR_REGISTRATIES', {
      transformResponse: transformToeristischeVerhuur,
    }),
    sessionID,
    passthroughRequestHeaders
  );
}

export async function fetchToeristischeVerhuur(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  if (!FeatureToggle.toeristischeVerhuurActive) {
    return apiSuccesResult({
      vergunningen: [],
      registraties: [],
    });
  }
  const registratiesRequest = fetchRegistraties(
    sessionID,
    passthroughRequestHeaders
  );

  const vergunningenRequest = fetchVergunningen(
    sessionID,
    passthroughRequestHeaders,
    {
      appRoute: AppRoutes.TOERISTISCHE_VERHUUR,
      filter: (vergunning) =>
        toeristischeVerhuurVergunningTypes.includes(vergunning.caseType),
    }
  );

  const [
    registratiesResponse,
    vergunningenResponse,
  ] = await Promise.allSettled([registratiesRequest, vergunningenRequest]);

  const registraties = getSettledResult(registratiesResponse);
  const vergunningen = getSettledResult(vergunningenResponse);

  const failedDependencies = getFailedDependencies({
    registraties,
    vergunningen,
  });

  return apiSuccesResult(
    {
      registraties: registraties.content || [],
      vergunningen: vergunningen.content || [],
    },
    failedDependencies
  );
}
