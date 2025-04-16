import { generatePath } from 'react-router';

import {
  ErfpachtErpachterResponseSource,
  ErfpachtErpachterResponse,
  ErfpachtDossiersResponse,
  ErfpachtDossiersDetail,
  ErfpachtDossiersDetailSource,
  ErfpachtDossierSource,
  ErfpachtDossierPropsFrontend,
} from './erfpacht-types';
import { AppRoutes } from '../../../universal/config/routes';
import { defaultDateFormat } from '../../../universal/helpers/date';
import { jsonCopy, sortAlpha } from '../../../universal/helpers/utils';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';

function transformIsErfpachterResponseSource(
  responseData: ErfpachtErpachterResponseSource,
  profileType: ProfileType
): ErfpachtErpachterResponse {
  return {
    isKnown: !!responseData?.erfpachter,
    relatieCode: responseData?.relationCode,
    profileType,
  };
}

function getDossierNummerUrlParam(dossierNummer: string) {
  return `E${dossierNummer.split(/E|\//).join('.')}`;
}

export function transformErfpachtDossierProperties<
  T extends ErfpachtDossierSource | ErfpachtDossiersDetailSource,
>(dossierSource: T): T & ErfpachtDossierPropsFrontend {
  const dossier: T = jsonCopy(dossierSource);
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
    dossier.facturen.facturen = dossier.facturen.facturen?.map((factuur) => {
      factuur.vervalDatum = defaultDateFormat(factuur.vervalDatum);
      factuur.dossierNummerUrlParam = getDossierNummerUrlParam(
        dossier.dossierNummer
      );
      return factuur;
    });
  }
  const zaak: T & ErfpachtDossierPropsFrontend = Object.assign(dossier, {
    dossierNummerUrlParam,
    title,
    steps: [],
    displayStatus: '',
    id: dossierNummerUrlParam,
    link: {
      to: generatePath(AppRoutes['ERFPACHT/DOSSIERDETAIL'], {
        dossierNummerUrlParam,
      }),
      title,
    },
  });

  return zaak;
}

export function transformDossierResponse(
  responseDataSource: ErfpachtDossiersResponse,
  relatieCode: ErfpachtErpachterResponseSource['relationCode']
) {
  const responseData: ErfpachtDossiersResponse = responseDataSource
    ? jsonCopy(responseDataSource)
    : {};
  const hasDossiers = !!responseData?.dossiers?.dossiers?.length;

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

export async function fetchErfpacht(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
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
    requestID,
    authProfileAndToken
  );

  if (
    !!erfpachterResponse.content?.isKnown &&
    authProfileAndToken.profile.profileType !== 'commercial' // Commerciële  gebruikers (EHerkenning) maken gebruik van een eigen portaal (Patroon C)
  ) {
    return requestData<ErfpachtDossiersResponse>(
      {
        ...config,
        url: `${config.url}/vernise/api/dossierinfo`,
        transformResponse: (responseData) =>
          transformDossierResponse(
            responseData,
            erfpachterResponse.content.relatieCode
          ),
      },
      requestID,
      authProfileAndToken
    );
  }

  return erfpachterResponse;
}

export async function fetchErfpachtDossiersDetail(
  requestID: RequestID,
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
    requestID,
    authProfileAndToken
  );

  return dossierInfoResponse;
}
