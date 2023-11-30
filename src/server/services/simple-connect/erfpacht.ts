import * as Sentry from '@sentry/node';
import crypto from 'crypto';
import { Chapters } from '../../../universal/config';
import { DataRequestConfig, getApiConfig } from '../../config';
import { AuthProfileAndToken } from '../../helpers/app';
import { fetchService, fetchTipsAndNotifications } from './api-service';
import { requestData } from '../../helpers';
import { getSettledResult } from '../../../universal/helpers';

function encryptPayload(payload: string) {
  const encryptionKey = process.env.BFF_MIJN_ERFPACHT_ENCRYPTION_KEY_V2 + '';
  const iv = crypto.randomBytes(16).toString('base64').slice(0, 16);
  const ivBuffer = Buffer.from(iv, 'utf-8');
  const cipher = crypto.createCipheriv('aes-128-cbc', encryptionKey, ivBuffer);
  const encrypted = Buffer.concat([cipher.update(payload), cipher.final()]);

  return [ivBuffer.toString(), encrypted.toString('base64url')] as const;
}

function encryptPayloadWithoutForwardSlashes(
  payload: string
): ReturnType<typeof encryptPayload> {
  const encrypted = encryptPayload(payload);
  if (encrypted[1] && encrypted[1].includes('/')) {
    return encryptPayloadWithoutForwardSlashes(payload);
  }
  return encrypted;
}

type ErfpachtSourceResponse = boolean;

function transformErfpachtResponse(isKnown: ErfpachtSourceResponse) {
  return {
    isKnown: isKnown ?? false,
  };
}

export function getConfigMain(
  authProfileAndToken: AuthProfileAndToken,
  requestID: requestID
): DataRequestConfig {
  const profile = authProfileAndToken.profile;
  const [iv, payload] = encryptPayloadWithoutForwardSlashes(profile.id + '');
  const type = profile.profileType === 'commercial' ? 'company' : 'user';
  const config = {
    url: `${process.env.BFF_MIJN_ERFPACHT_API_URL}/api/v2/check/groundlease/${type}/${payload}`,
    cacheKey: `erfpacht-main-${requestID}`,
    headers: {
      'X-RANDOM-IV': iv,
      'X-API-KEY': process.env.BFF_MIJN_ERFPACHT_API_KEY + '',
    },
    transformResponse: (response: ErfpachtSourceResponse) =>
      transformErfpachtResponse(response),
  };

  return getApiConfig('ERFPACHT', config);
}

export async function fetchErfpacht(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  return fetchService(
    requestID,
    getConfigMain(authProfileAndToken, requestID),
    false
  );
}

function getConfigNotifications(
  authProfileAndToken: AuthProfileAndToken,
  requestID: requestID
): DataRequestConfig {
  const profile = authProfileAndToken.profile;
  const [iv, payload] = encryptPayloadWithoutForwardSlashes(profile.id + '');
  const type = profile.profileType === 'commercial' ? 'kvk' : 'bsn';

  return getApiConfig('ERFPACHT', {
    url: `${process.env.BFF_MIJN_ERFPACHT_API_URL}/api/v2/notifications/${type}/${payload}`,
    cacheKey: `erfpacht-notifications-${requestID}`,
    headers: {
      'X-RANDOM-IV': iv,
      'X-API-KEY': process.env.BFF_MIJN_ERFPACHT_API_KEY + '',
    },
    transformResponse: (response) => {
      return { notifications: Array.isArray(response) ? response : [] };
    },
  });
}

export async function fetchErfpachtNotifications(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const response = await fetchTipsAndNotifications(
    requestID,
    getConfigNotifications(authProfileAndToken, requestID),
    Chapters.ERFPACHT
  );

  return response;
}

function getNamedResponseTransformer(apiName: string) {
  return function transformResponse(res: any) {
    Sentry.captureMessage(`${apiName}: response`, {
      extra: {
        data: JSON.stringify(res),
      },
    });

    return res;
  };
}

interface Erfpachtv2ErpachterResponseSource {
  isErfpachter: boolean;
  relationID: string;
  name: string;
}

interface Erfpachtv2ErpachterResponse {
  isKnown: boolean;
}

function transformIsErfpachterResponseSource(
  response: Erfpachtv2ErpachterResponseSource
): Erfpachtv2ErpachterResponse {
  console.log('isErfpachter:', response);
  return {
    isKnown: response.isErfpachter,
  };
}

interface ErfpachtDossierInfoFactuur {
  notaNummer: string;
  titelFacturenNotaNummer: string;
  factuurBedrag: string;
  titelFacturenFactuurBedrag: string;
  openstaandBedrag: string;
  titelFacturenOpenstaandBedrag: string;
  vervalDatum: string;
  titelFacturenVervaldatum: string;
}

interface ErfpachtDossierInfoToekomstigePeriode {
  periodeVan: string;
  titelFinancieelToekomstigePeriodeVan: string;
  algemeneBepaling: string;
  titelFinancieelToekomstigeAlgemeneBepaling: string;
  regime: string;
  titelFinancieelToekomstigeRegime: string;
  canonOmschrijving: string;
  titelFinancieelToekomstigeCanon: string;
}

interface ErfpachtDossierInfoHuidigePeriode {
  periodeVan: string;
  titelFinancieelPeriodeVan: string;
  periodeTm: string;
  algemeneBepaling: string;
  titelFinancieelAlgemeneBepaling: string;
  regime: string;
  titelFinancieelRegime: string;
  canonOmschrijving: string;
  titelFinancieelCanon: string;
}

interface ErfpachtDossierInfoVoorkeursAdres {
  adres: string;
}
interface ErfpachtDossierInfoKadastraleAanduiding {
  gemeenteCode: string;
  gemeenteNaam: string;
  sectie: string;
  perceelsnummer: 0;
  letter: string;
  volgnummer: 0;
  samengesteld: string;
}
interface ErfpachtDossierInfoRelatie {
  relatieNaam: string;
  betaler: true;
  indicatieGeheim: true;
}
interface ErfpachtDossierInfoJuridisch {
  ingangsdatum: string;
  titelIngangsdatum: string;
  algemeneBepaling: string;
  titelAlgemeneBepaling: string;
  soortErfpacht: string;
  titelSoortErfpacht: string;
}
interface ErfpachtDossierInfoBestemming {
  omschrijving: string;
  titelBestemmingOmschrijving: string;
  categorie: string;
  oppervlakte: number;
  eenheid: string;
  titelBestemmingEenheidBVO: string;
  titelBestemmingEenheidGO: string;
}

interface Erfpachtv2DossierInfoResponseSource {
  dossierNummer: string;
  titelDossierNummer: string;
  voorkeursadres: ErfpachtDossierInfoVoorkeursAdres[];
  titelVoorkeursadres: string;
  kadastraleaanduiding: ErfpachtDossierInfoKadastraleAanduiding[];
  titelKadastraleaanduiding: string;
  eersteUitgifte: string;
  titelEersteUitgifte: string;
  relaties: ErfpachtDossierInfoRelatie[];
  titelBetaler: string;
  juridisch: ErfpachtDossierInfoJuridisch;
  bestemmingen: ErfpachtDossierInfoBestemming[];
  financieel: {
    huidigePeriode: ErfpachtDossierInfoHuidigePeriode;
    toekomstigePeriode: ErfpachtDossierInfoToekomstigePeriode;
  };
  facturen: ErfpachtDossierInfoFactuur[];
}

type Erfpachtv2DossierInfoResponse = Erfpachtv2DossierInfoResponseSource;

export async function fetchErfpachtV2(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const config = getApiConfig('ERFPACHTv2');

  const isErfpachterResponse = await requestData<Erfpachtv2ErpachterResponse>(
    {
      ...config,
      url: `${config.url}/vernise/api/erfpachter `,
      transformResponse: transformIsErfpachterResponseSource,
    },
    requestID,
    authProfileAndToken
  );

  if (isErfpachterResponse.status === 'OK') {
    if (isErfpachterResponse.content.isKnown) {
      const dossierInfoResponse =
        await requestData<Erfpachtv2DossierInfoResponse>(
          {
            ...config,
            url: `${config.url}/vernise/api/dossierinfo`,
          },
          requestID
        );

      return dossierInfoResponse;
    }
  }

  return isErfpachterResponse;
}
