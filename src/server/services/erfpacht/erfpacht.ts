import { generatePath } from 'react-router';

import { fetchErfpachtDossierInfo } from './erfpacht-dossiers.ts';
import { dataRequestConfig } from './erfpacht-service-config.ts';
import type {
  ErfpachtResponseFrontend,
  ErfpachtErpachterResponse,
  ErfpachtErpachterResponseSource,
} from './erfpacht-types.ts';
import { fetchErfpachtZaakInfo } from './erfpacht-zaken.ts';
import { themaConfig } from '../../../client/pages/Thema/Erfpacht/Erfpacht-thema-config.ts';
import {
  type ApiResponse,
  apiErrorResult,
  apiSuccessResult,
} from '../../../universal/helpers/api.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import { getFromEnv } from '../../helpers/env.ts';
import { getCustomApiConfig } from '../../helpers/source-api-helpers.ts';
import { requestData } from '../../helpers/source-api-request.ts';

function transformIsErfpachterResponseSource(
  responseData: ErfpachtErpachterResponseSource,
  profileType: ProfileType
): ErfpachtErpachterResponse {
  const response: ErfpachtErpachterResponse = {
    isKnown: !!responseData?.erfpachter,
    relatieCode: responseData?.relationCode,
    profileType,
  };

  if (response.profileType === 'commercial') {
    response.url = getFromEnv('BFF_SSO_URL_ERFPACHT_ZAKELIJK') ?? '';
  }

  return response;
}

async function fetchErfpachter(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<ErfpachtErpachterResponse>> {
  const config = getCustomApiConfig(dataRequestConfig, {
    formatUrl(requestConfig) {
      return `${requestConfig.url}/vernise/api/erfpachter`;
    },
    transformResponse: (responseData: ErfpachtErpachterResponseSource) =>
      transformIsErfpachterResponseSource(
        responseData,
        authProfileAndToken.profile.profileType
      ),
  });

  const erfpachterResponse = await requestData<ErfpachtErpachterResponse>(
    config,
    authProfileAndToken
  );

  return erfpachterResponse;
}

export async function fetchErfpacht(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<ErfpachtResponseFrontend | ErfpachtErpachterResponse>> {
  // Commerciële gebruikers (EHerkenning) maken gebruik van een eigen portaal (Patroon C)
  // Het is niet nodig om voor deze gebruikers dossiers op te halen, omdat zij deze ook niet in het portaal kunnen inzien.
  const isNotCommercial =
    authProfileAndToken.profile.profileType !== 'commercial';

  const erfpachterResponse = await fetchErfpachter(authProfileAndToken);

  if (!!erfpachterResponse.content?.isKnown && isNotCommercial) {
    const dossierInfoRequest = fetchErfpachtDossierInfo(
      erfpachterResponse.content.relatieCode,
      authProfileAndToken
    );
    const zaakInfoRequest = fetchErfpachtZaakInfo(authProfileAndToken);
    const [dossierInfoResponse, zaakInfoResponse] = await Promise.all([
      dossierInfoRequest,
      zaakInfoRequest,
    ]);

    if (dossierInfoResponse.status !== 'OK') {
      return apiErrorResult('Failed to fetch dossier info', null);
    }

    const responseContent: ErfpachtResponseFrontend = {
      ...dossierInfoResponse.content,
      zaken: (zaakInfoResponse.content ?? []).map((zaak) => {
        return {
          ...zaak,
          dossierLinks:
            zaak.zaakDossiers?.map((dossierNummer) => {
              const dossier =
                dossierInfoResponse.content?.dossiers.dossiers.find(
                  (dossier) => dossier.dossierNummer === dossierNummer
                );
              if (!dossier) {
                return dossierNummer;
              }
              const dossierId = dossier?.dossierId;
              return {
                to: generatePath(themaConfig.detailPageDossier.route.path, {
                  dossierId,
                }),
                title: dossierNummer,
              };
            }) ?? [],
        };
      }),
    };
    return apiSuccessResult(responseContent);
  }

  return erfpachterResponse;
}
