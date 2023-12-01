import * as Sentry from '@sentry/node';
import crypto from 'crypto';
import { AppRoutes, Chapters } from '../../../universal/config';
import { DataRequestConfig, getApiConfig } from '../../config';
import { requestData } from '../../helpers';
import { AuthProfileAndToken } from '../../helpers/app';
import { fetchService, fetchTipsAndNotifications } from './api-service';
import {
  ApiErrorResponse,
  ApiResponse,
  ApiSuccessResponse,
  apiSuccessResult,
} from '../../../universal/helpers';
import { generatePath } from 'react-router-dom';
import { LinkProps } from '../../../universal/types';
import slug from 'slugme';
import { decrypt } from '../../../universal/helpers/encrypt-decrypt';

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
  erfpachter: boolean;
  relationID: string;
  relationCode: string;
  name: string;
  email: string;
  phoneNumber: string;
  aantalRechten: 0;
  laatsteMutatieDatum: string;
  businessType: string;
}

interface Erfpachtv2ErpachterResponse {
  isKnown: boolean;
}

function transformIsErfpachterResponseSource(
  response: Erfpachtv2ErpachterResponseSource
): Erfpachtv2ErpachterResponse {
  return {
    isKnown: response.erfpachter,
  };
}

interface ErfpachtDossierInfoDetailNota {
  dossierAdres: string;
  titelFacturenDossierAdres: string;
  status: string;
  titelFacturenStatus: string;
  stopcode: string;
  open: boolean;
  notaNummer: string;
  titelFacturenNotaNummer: string;
  factuurBedrag: string;
  formattedFactuurBedrag: string;
  titelFacturenFactuurBedrag: string;
  openstaandBedrag: string;
  formattedOpenstaandBedrag: string;
  titelFacturenOpenstaandBedrag: string;
  vervalDatum: string;
  titelFacturenVervaldatum: string;
}

interface ErfpachtDossierInfoDetailToekomstigePeriode {
  periodeVan: string;
  titelFinancieelToekomstigePeriodeVan: string;
  periodeTm: string;
  algemeneBepaling: string;
  titelFinancieelToekomstigeAlgemeneBepaling: string;
  regime: string;
  titelFinancieelToekomstigeRegime: string;
  canonOmschrijvingen: string[];
  titelFinancieelToekomstigeCanon: string;
}

interface ErfpachtDossierInfoDetailHuidigePeriodeCanon {
  canonBedrag: string;
  formattedCanonBedrag: string;
  canonBeginJaar: string;
  samengesteld: string;
}

interface ErfpachtDossierInfoDetailHuidigePeriode {
  periodeVan: string;
  titelFinancieelPeriodeVan: string;
  periodeTm: string;
  algemeneBepaling: string;
  titelFinancieelAlgemeneBepaling: string;
  regime: string;
  titelFinancieelRegime: string;
  canons: ErfpachtDossierInfoDetailHuidigePeriodeCanon[];
  titelFinancieelCanon: 'Canon';
}

interface ErfpachtDossierInfoDetailKadastraleAanduiding {
  gemeenteCode: string;
  gemeenteNaam: string;
  sectie: string;
  perceelsnummer: 0;
  letter: string;
  volgnummer: 0;
  samengesteld: string;
}

interface ErfpachtDossierInfoDetailRelatie {
  relatieNaam: string;
  betaler: true;
  indicatieGeheim: true;
}

interface ErfpachtDossierInfoDetailJuridisch {
  ingangsdatum: string;
  titelIngangsdatum: string;
  algemeneBepaling: string;
  titelAlgemeneBepaling: string;
  soortErfpacht: string;
  uitgeschrevenSoortErfpacht: string;
  titelSoortErfpacht: string;
}

interface ErfpachtDossierInfoDetailBestemming {
  samengesteldeOmschrijving: string;
  titelBestemmingOmschrijving: string;
  categorie: string;
  subCategorie: string;
  omschrijving: string;
  oppervlakte: number;
  eenheid: string;
  titelBestemmingEenheidBVO: string;
  titelBestemmingEenheidGO: string;
}

interface Erfpachtv2DossierInfoDetailsResponseSource {
  dossierNummer: string;
  titelDossierNummer: string;
  voorkeursadres: string;
  titelVoorkeursadres: string;
  kadastraleaanduiding: ErfpachtDossierInfoDetailKadastraleAanduiding[];
  titelKadastraleaanduiding: string;
  eersteUitgifte: string;
  titelEersteUitgifte: string;
  relaties: ErfpachtDossierInfoDetailRelatie[];
  titelBetaler: string;
  juridisch: ErfpachtDossierInfoDetailJuridisch;
  bestemmingen: ErfpachtDossierInfoDetailBestemming[];
  financieel: {
    huidigePeriode: ErfpachtDossierInfoDetailHuidigePeriode;
    toekomstigePeriodeList: ErfpachtDossierInfoDetailToekomstigePeriode[];
  };
  facturen: {
    betaler: string;
    debiteurnummer: string;
    notas: ErfpachtDossierInfoDetailNota[];
  };
}

type Erfpachtv2DossierInfoDetailsResponse =
  Erfpachtv2DossierInfoDetailsResponseSource;

interface Erfpachtv2Dossier {
  dossierNummer: string;
  titelDossierNummer: string;
  voorkeursadres: string;
  titelVoorkeursadres: string;
  titelZaaknummer: string;
  zaaknummer: string;
  titelWijzigingsAanvragen: string;
  wijzigingsAanvragen: string[];

  // Added specifically for front-end
  id: string;
  link: LinkProps;
  title: string;
}

interface Erfpachtv2DossierResponsePayloadSource {
  titelDossiersKop: string;
  dossiers: Erfpachtv2Dossier[];
  titelOpenFacturenKop: string;
  openFacturen: ErfpachtDossierInfoDetailNota[];
}

type Erfpachtv2DossierResponsePayload = Erfpachtv2DossierResponsePayloadSource;

function transformDossierResponse(response: Erfpachtv2DossierResponsePayload) {
  if (response?.dossiers?.length) {
    response.dossiers = response.dossiers.map((dossier) => {
      const id = slug(dossier.dossierNummer);
      const title = `${dossier.dossierNummer} - ${dossier.voorkeursadres}`;
      return {
        ...dossier,
        id,
        title,
        link: {
          to: generatePath(AppRoutes['ERFPACHTv2/DOSSIER'], { id }),
          title,
        },
      };
    });
  }
  return response;
}

export async function fetchErfpachtV2(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const config = getApiConfig('ERFPACHTv2');

  const dossierInfoResponsePayloadEmpty: Erfpachtv2DossierResponsePayload = {
    dossiers: [],
    openFacturen: [],
    titelDossiersKop: '',
    titelOpenFacturenKop: '',
  };

  const dossierInfoResponseEmpty = apiSuccessResult(
    dossierInfoResponsePayloadEmpty
  );

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
      return requestData<Erfpachtv2DossierResponsePayload>(
        {
          ...config,
          url: `${config.url}/vernise/api/dossierinfo`,
          transformResponse: transformDossierResponse,
        },
        requestID
      );
    }

    return dossierInfoResponseEmpty;
  }

  return isErfpachterResponse;
}

export async function fetchErfpachtV2DossierDetails(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  dossierNummerEncrypted: string
) {
  const config = getApiConfig('ERFPACHTv2');
  const dossierNummer = decrypt(
    dossierNummerEncrypted,
    process.env.BFF_GENERAL_ENCRYPTION_KEY ?? ''
  );
  const dossierInfoResponse =
    await requestData<Erfpachtv2DossierInfoDetailsResponse>(
      {
        ...config,
        url: `${config.url}/vernise/api/dossierinfo/${dossierNummer}`,
      },
      requestID
    );

  return dossierInfoResponse;
}
