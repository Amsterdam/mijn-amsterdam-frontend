import { generatePath } from 'react-router';

import {
  ErfpachtErpachterResponseSource,
  ErfpachtErpachterResponse,
  ErfpachtDossiersResponse,
  ErfpachtDossiersDetail,
  ErfpachtDossiersDetailSource,
  ErfpachtDossierSource,
  ErfpachtDossierPropsFrontend,
  type ErfpachtDossierFactuurFrontend,
  type ErfpachtDossiersResponseSource,
} from './erfpacht-types';
import { routeConfig } from '../../../client/pages/Thema/Erfpacht/Erfpacht-thema-config';
import { defaultDateFormat } from '../../../universal/helpers/date';
import { jsonCopy, sortAlpha } from '../../../universal/helpers/utils';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { getFromEnv } from '../../helpers/env';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';

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

function getDossierNummerUrlParam(
  dossierNummer: string | undefined
): string | null {
  return dossierNummer ? `E${dossierNummer.split(/E|\//).join('.')}` : null;
}

export function transformErfpachtDossierProperties<
  T extends ErfpachtDossierSource | ErfpachtDossiersDetailSource,
>(dossierSource: T): ErfpachtDossierPropsFrontend<T> {
  const dossier: T = structuredClone(dossierSource);
  const dossierNummerUrlParam = getDossierNummerUrlParam(dossier.dossierNummer);
  const title = `${dossier.dossierNummer}: ${dossier.voorkeursadres}`;

  // Filter out relaties that we don't want to show in the frontend.
  if ('relaties' in dossier && !!dossier.relaties) {
    dossier.relaties = dossier.relaties.filter(
      (relatie) => relatie.indicatieGeheim === false
    );
  }

  if (
    'bijzondereBepalingen' in dossier &&
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

  if ('juridisch' in dossier && !!dossier?.juridisch?.ingangsdatum) {
    dossier.juridisch.ingangsdatum = defaultDateFormat(
      dossier.juridisch.ingangsdatum
    );
  }

  if ('eersteUitgifte' in dossier) {
    dossier.eersteUitgifte = defaultDateFormat(dossier.eersteUitgifte);
  }

  if ('facturen' in dossier && 'facturen' in dossier.facturen) {
    const facturen: ErfpachtDossierFactuurFrontend[] =
      dossier.facturen.facturen?.map((factuur) => {
        const updatedFactuur: ErfpachtDossierFactuurFrontend = {
          ...factuur,
          vervalDatum: defaultDateFormat(factuur.vervalDatum),
          dossierNummerUrlParam: getDossierNummerUrlParam(
            dossier.dossierNummer
          ),
        };

        return updatedFactuur;
      }) ?? [];

    dossier.facturen.facturen = facturen;
  }

  const zaak: ErfpachtDossierPropsFrontend<T> = Object.assign(dossier, {
    dossierNummerUrlParam,
    title,
    id: dossierNummerUrlParam ?? dossier.voorkeursadres,
    link: {
      to: generatePath(routeConfig.detailPage.path, {
        dossierNummerUrlParam,
      }),
      title,
    },
  });

  return zaak;
}

export function transformDossierResponse(
  responseDataSource: ErfpachtDossiersResponseSource,
  relatieCode: ErfpachtErpachterResponseSource['relationCode']
): ErfpachtDossiersResponse | null {
  const responseData: ErfpachtDossiersResponse = responseDataSource
    ? jsonCopy(responseDataSource)
    : {};
  const hasDossiers = !!responseData?.dossiers?.dossiers?.length;

  if (!hasDossiers) {
    return null;
  }

  responseData.dossiers.dossiers =
    responseData.dossiers?.dossiers
      .map((dossier) => {
        return transformErfpachtDossierProperties(dossier);
      })
      .sort(sortAlpha('voorkeursadres', 'asc')) ?? [];

  responseData.openstaandeFacturen.facturen =
    responseData.openstaandeFacturen?.facturen?.map((factuur) => {
      return {
        ...factuur,
        dossierNummerUrlParam: getDossierNummerUrlParam(factuur.dossierAdres),
        vervalDatum: defaultDateFormat(factuur.vervalDatum),
      };
    }) ?? [];

  responseData.relatieCode = relatieCode;
  responseData.isKnown = hasDossiers;

  return responseData;
}

export async function fetchErfpacht(authProfileAndToken: AuthProfileAndToken) {
  const config = getApiConfig('ERFPACHT');

  const erfpachterResponse = await requestData<ErfpachtErpachterResponse>(
    {
      ...config,
      url: `${config.url}/vernise/api/erfpachter`,
      transformResponse: (responseData) =>
        transformIsErfpachterResponseSource(
          responseData,
          authProfileAndToken.profile.profileType
        ),
    },
    authProfileAndToken
  );

  // Commerciële gebruikers (EHerkenning) maken gebruik van een eigen portaal (Patroon C)
  const isNotCommercial =
    authProfileAndToken.profile.profileType !== 'commercial';

  if (!!erfpachterResponse.content?.isKnown && isNotCommercial) {
    return requestData<ErfpachtDossiersResponse | null>(
      {
        ...config,
        url: `${config.url}/vernise/api/dossierinfo`,
        transformResponse: (responseData) =>
          transformDossierResponse(
            responseData,
            erfpachterResponse.content.relatieCode
          ),
      },
      authProfileAndToken
    );
  }

  return erfpachterResponse;
}

export async function fetchErfpachtDossiersDetail(
  authProfileAndToken: AuthProfileAndToken,
  dossierNummerUrlParam: string
) {
  const config = getApiConfig('ERFPACHT');
  const dossierInfoResponse = await requestData<ErfpachtDossiersDetail>(
    {
      ...config,
      url: new URL(
        `${config.url}/vernise/api/dossierinfo/${dossierNummerUrlParam}`
      ).toString(),
      transformResponse: transformErfpachtDossierProperties,
    },
    authProfileAndToken
  );

  return dossierInfoResponse;
}
