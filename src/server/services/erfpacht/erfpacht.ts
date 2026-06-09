import { generatePath } from 'react-router';

import { dataRequestConfig, routes } from './erfpacht-service-config.ts';
import type {
  ErfpachtErpachterResponseSource,
  ErfpachtErpachterResponse,
  ErfpachtDossiersResponse,
  ErfpachtDossiersDetail,
  ErfpachtDossiersDetailSource,
  ErfpachtDossierSource,
  ErfpachtDossierPropsFrontend,
  ErfpachtResponseFrontend,
} from './erfpacht-types.ts';
import { type ErfpachtDossiersResponseSource } from './erfpacht-types.ts';
import type {
  ErfpachtZaakDetailFrontend,
  ErfpachtZaakDetailSource,
  ErfpachtZaakStatussenSource,
  ZaakInfoFrontend,
  ZaakInfoResponseSource,
  ZaakInfoSource,
  ZaakStatusFrontend,
} from './erfpacht-zaken-types.ts';
import { themaConfig } from '../../../client/pages/Thema/Erfpacht/Erfpacht-thema-config.ts';
import {
  apiErrorResult,
  apiSuccessResult,
  getFailedDependencies,
  getSettledResult,
  type ApiResponse,
} from '../../../universal/helpers/api.ts';
import { defaultDateFormat } from '../../../universal/helpers/date.ts';
import { jsonCopy, pick, sortAlpha } from '../../../universal/helpers/utils.ts';
import type { StatusLineItem } from '../../../universal/types/App.types.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import { getFromEnv } from '../../helpers/env.ts';
import { getCustomApiConfig } from '../../helpers/source-api-helpers.ts';
import { requestData } from '../../helpers/source-api-request.ts';
import { generateFullApiUrlBFF } from '../../routing/route-helpers.ts';

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

function getDossierNummerUrlParam(dossierNummer: string): string {
  return dossierNummer
    ? (dossierNummer.match(/[a-zA-Z]+|[0-9]+/g)?.join('.') ?? dossierNummer)
    : dossierNummer;
}

export function transformErfpachtDossierProperties<
  T extends D | null,
  D extends ErfpachtDossierSource | ErfpachtDossiersDetailSource,
>(dossierSource: T): ErfpachtDossierPropsFrontend<D> | null {
  if (!dossierSource) {
    return null;
  }

  // Copy dossierSource to avoid mutating the original object, as we need to make some adjustments to the properties for frontend use.
  const dossier: D = jsonCopy(dossierSource);

  const dossierId =
    dossier.dossierId || getDossierNummerUrlParam(dossier.dossierNummer);
  const title = `${dossier.dossierNummer}: ${dossier.voorkeursadres}`;

  // Filter out relaties that we don't want to show in the frontend.
  if ('relaties' in dossier && Array.isArray(dossier.relaties)) {
    dossier.relaties = dossier.relaties.filter(
      (relatie) => relatie.indicatieGeheim === false
    );
  }

  if (
    'bijzondereBepalingen' in dossier &&
    Array.isArray(dossier.bijzondereBepalingen) &&
    dossier.bijzondereBepalingen?.length
  ) {
    dossier.bijzondereBepalingen = dossier.bijzondereBepalingen.map(
      (bepaling) => {
        if (bepaling.samengesteldeOppervlakteEenheid.trim() === '0') {
          bepaling.samengesteldeOppervlakteEenheid = '-';
        }
        return bepaling;
      }
    );
  }

  if ('juridisch' in dossier && dossier?.juridisch?.ingangsdatum) {
    dossier.juridisch.ingangsdatum = defaultDateFormat(
      dossier.juridisch.ingangsdatum
    );
  }

  if ('eersteUitgifte' in dossier && dossier.eersteUitgifte) {
    dossier.eersteUitgifte = defaultDateFormat(dossier.eersteUitgifte);
  }

  const zaak: ErfpachtDossierPropsFrontend<D> = Object.assign(dossier, {
    dossierId,
    title,
    id: dossierId ?? dossier.voorkeursadres,
    link: {
      to: generatePath(themaConfig.detailPage.route.path, {
        dossierId,
      }),
      title,
    },
  });

  return zaak;
}

export function transformDossierResponse(
  responseDataSource: ErfpachtDossiersResponseSource | null,
  relatieCode: ErfpachtErpachterResponseSource['relationCode']
): ErfpachtDossiersResponse | null {
  if (!responseDataSource?.dossiers?.dossiers?.length) {
    return null;
  }

  const dossiers =
    responseDataSource.dossiers.dossiers
      .map((dossier) => {
        return transformErfpachtDossierProperties(dossier);
      })
      .filter((dossier) => dossier !== null)
      .sort(sortAlpha('voorkeursadres', 'asc')) ?? [];

  const responseData: ErfpachtDossiersResponse = {
    ...responseDataSource,
    dossiers: {
      ...responseDataSource.dossiers,
      dossiers,
    },
    relatieCode,
    isKnown: true,
  };

  return responseData;
}

export async function fetchErfpacht(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<ErfpachtResponseFrontend | ErfpachtErpachterResponse>> {
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

  // Commerciële gebruikers (EHerkenning) maken gebruik van een eigen portaal (Patroon C)
  // Het is niet nodig om voor deze gebruikers dossiers op te halen, omdat zij deze ook niet in het portaal kunnen inzien.
  const isNotCommercial =
    authProfileAndToken.profile.profileType !== 'commercial';

  if (!!erfpachterResponse.content?.isKnown && isNotCommercial) {
    const dossierInfoRequest = fetchErfpachtDossierInfo(
      erfpachterResponse.content.relatieCode,
      authProfileAndToken
    );
    const zaakInfoRequest = fetchErfpachtZaakInfo(authProfileAndToken);
    const [dossierInfoResponse, zaakInfoResponse] = await Promise.allSettled([
      dossierInfoRequest,
      zaakInfoRequest,
    ]);
    const dossierInfoResult = getSettledResult(dossierInfoResponse);
    const zaakInfoResult = getSettledResult(zaakInfoResponse);

    if (dossierInfoResult.status !== 'OK') {
      return apiErrorResult('Failed to fetch dossier info', null);
    }

    const responseContent: ErfpachtResponseFrontend = {
      ...dossierInfoResult.content,
      zaken: zaakInfoResult.content ?? [],
    };
    return apiSuccessResult(
      responseContent,
      getFailedDependencies(responseContent)
    );
  }

  return erfpachterResponse;
}

async function fetchErfpachtDossierInfo(
  relatieCode: string,
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<ErfpachtDossiersResponse>> {
  const config = getCustomApiConfig(dataRequestConfig, {
    formatUrl(requestConfig) {
      return `${requestConfig.url}/vernise/api/dossierinfo`;
    },
    transformResponse: (responseData: ErfpachtDossiersResponseSource) =>
      transformDossierResponse(responseData, relatieCode),
  });

  return requestData<ErfpachtDossiersResponse>(config, authProfileAndToken);
}

export async function fetchErfpachtDossiersDetail(
  authProfileAndToken: AuthProfileAndToken,
  dossierId: string
): Promise<ApiResponse<ErfpachtDossiersDetail>> {
  const config = getCustomApiConfig(dataRequestConfig, {
    formatUrl(requestConfig) {
      return `${requestConfig.url}/vernise/api/dossierinfo/${dossierId}`;
    },
    transformResponse: transformErfpachtDossierProperties,
  });

  const dossierInfoResponse = await requestData<ErfpachtDossiersDetail>(
    config,
    authProfileAndToken
  );

  return dossierInfoResponse;
}

function transformErfpachtZakenResponse(
  zakenResponseSource: ZaakInfoResponseSource
): ZaakInfoFrontend[] {
  return (zakenResponseSource.content ?? []).map((zaakInfo) => {
    return {
      ...zaakInfo,
      fetchZaakDetailUrl: generateFullApiUrlBFF(
        routes.protected.ERFPACHT_ZAAK_DETAILS,
        {
          uuid: zaakInfo.zaakUuid,
          zaakUrl: zaakInfo.zaakUrl,
        }
      ),
    };
  });
}

export async function fetchErfpachtZaakInfo(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<ZaakInfoFrontend[]>> {
  const config = getCustomApiConfig(dataRequestConfig, {
    formatUrl(requestConfig) {
      return `${requestConfig.url}/vernise/api/zaakinfo`;
    },
    params: {
      page: 1,
      size: 100,
      sort: ['desc'],
    },
    transformResponse: transformErfpachtZakenResponse,
  });

  const zaakInfoResponse = await requestData<ZaakInfoFrontend[]>(
    config,
    authProfileAndToken
  );

  return zaakInfoResponse;
}

function transformErfpachtZaakDetailResponse(
  zaakDetailResponseSource: ErfpachtZaakDetailSource
): ErfpachtZaakDetailFrontend {
  const zaakDetail: ErfpachtZaakDetailFrontend = {
    ...pick(zaakDetailResponseSource, [
      'url',
      'uuid',
      'identificatie',
      'bronorganisatie',
      'omschrijving',
      'toelichting',
      'zaaktype',
      'registratiedatum',
      'verantwoordelijkeOrganisatie',
      'startdatum',
      'einddatum',
      'einddatumGepland',
      'uiterlijkeEinddatumAfdoening',
      'publicatiedatum',
      'communicatiekanaal',
      'productenOfDiensten',
      'vertrouwelijkheidaanduiding',
      'betalingsindicatie',
      'betalingsindicatieWeergave',
      'laatsteBetaaldatum',
      'zaakgeometrie',
    ]),
    title: zaakDetailResponseSource.omschrijving,
    id: zaakDetailResponseSource.uuid,
    link: {
      to: generatePath(themaConfig.detailPageZaak.route.path, {
        uuid: zaakDetailResponseSource.uuid,
      }),
      title: zaakDetailResponseSource.omschrijving,
    },
    steps: [],
    displayStatus: 'to be implemented',
  };

  return zaakDetail;
}

async function fetchErfpachtZaakDetail(
  authProfileAndToken: AuthProfileAndToken,
  uuid: ZaakInfoSource['zaakUuid']
): Promise<ApiResponse<ErfpachtZaakDetailFrontend>> {
  const config = getCustomApiConfig(dataRequestConfig, {
    formatUrl(requestConfig) {
      return `${requestConfig.url}/vernise/api/zaakinfo/${uuid}`;
    },
    transformResponse: transformErfpachtZaakDetailResponse,
  });

  const zaakInfoResponse = await requestData<ErfpachtZaakDetailFrontend>(
    config,
    authProfileAndToken
  );

  return zaakInfoResponse;
}

function getStatus(statustype: string): ZaakStatusFrontend {
  // TODO: implement
  return 'Ontvangen';
}

function transformErfpachtZaakStatussenResponse(
  zaakStatussenResponseSource: ErfpachtZaakStatussenSource
): StatusLineItem<ZaakStatusFrontend>[] {
  return zaakStatussenResponseSource.results.map((status) => {
    return {
      id: status.uuid,
      status: getStatus(status.statustype),
      datePublished: status.datumStatusGezet,
      isActive: false,
      isChecked: false,
    };
  });
}

async function fetchErfpachtZaakStatussen(
  authProfileAndToken: AuthProfileAndToken,
  zaakUrl: ErfpachtZaakDetailSource['url']
): Promise<ApiResponse<StatusLineItem<ZaakStatusFrontend>[]>> {
  const config = getCustomApiConfig(dataRequestConfig, {
    formatUrl(requestConfig) {
      return `${requestConfig.url}/vernise/api/zaakinfo/statussen`;
    },
    params: {
      zaak: zaakUrl,
    },
    transformResponse: transformErfpachtZaakStatussenResponse,
  });

  const zaakStatussenResponse = await requestData<
    StatusLineItem<ZaakStatusFrontend>[]
  >(config, authProfileAndToken);

  return zaakStatussenResponse;
}

export async function fetchZaakDetailWithStatussen(
  authProfileAndToken: AuthProfileAndToken,
  uuid: ZaakInfoSource['zaakUuid'],
  zaakUrl: ZaakInfoSource['zaakUrl']
): Promise<ApiResponse<ErfpachtZaakDetailFrontend>> {
  const zaakDetailRequest = fetchErfpachtZaakDetail(authProfileAndToken, uuid);
  const zaakStatussenRequest = fetchErfpachtZaakStatussen(
    authProfileAndToken,
    zaakUrl
  );

  const [zaakDetailResponse, zaakStatussenResponse] = await Promise.allSettled([
    zaakDetailRequest,
    zaakStatussenRequest,
  ]);

  const zaakDetailResult = getSettledResult(zaakDetailResponse);
  const zaakStatussenResult = getSettledResult(zaakStatussenResponse);

  if (zaakDetailResult.status !== 'OK' || zaakStatussenResult.status !== 'OK') {
    return apiErrorResult('Failed to fetch zaak detail or status', null);
  }

  return apiSuccessResult({
    ...zaakDetailResult.content,
    steps: zaakStatussenResult.content,
  });
}

export const forTesting = {
  transformIsErfpachterResponseSource,
  getDossierNummerUrlParam,
  transformErfpachtDossierProperties,
  transformDossierResponse,
  transformErfpachtZaakDetailResponse,
};
