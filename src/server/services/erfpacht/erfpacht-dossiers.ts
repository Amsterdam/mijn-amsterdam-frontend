import { generatePath } from 'react-router';

import { dataRequestConfig } from './erfpacht-service-config.ts';
import type {
  ErfpachtErpachterResponseSource,
  ErfpachtDossiersResponse,
  ErfpachtDossiersDetail,
  ErfpachtDossiersDetailSource,
  ErfpachtDossierSource,
  ErfpachtDossierPropsFrontend,
} from './erfpacht-types.ts';
import { type ErfpachtDossiersResponseSource } from './erfpacht-types.ts';
import { themaConfig } from '../../../client/apps/bob/pages/Thema/Erfpacht/Erfpacht-thema-config.ts';
import { type ApiResponse } from '../../../universal/helpers/api.ts';
import { defaultDateFormat } from '../../../universal/helpers/date.ts';
import { jsonCopy, sortAlpha } from '../../../universal/helpers/utils.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import { getCustomApiConfig } from '../../helpers/source-api-helpers.ts';
import { requestData } from '../../helpers/source-api-request.ts';

// Transforms numbers like EW/123/456 into EW.123.456, E/567/22 into E.567.22 for use in URL paths.
export function deriveDossierIdFromDossierNummer(
  dossierNummer: string
): string {
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
    dossier.dossierId ||
    deriveDossierIdFromDossierNummer(dossier.dossierNummer);
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
      to: generatePath(themaConfig.detailPageDossier.route.path, {
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

export async function fetchErfpachtDossierInfo(
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

export const forTesting = {
  getDossierNummerUrlParam: deriveDossierIdFromDossierNummer,
  transformErfpachtDossierProperties,
  transformDossierResponse,
};
