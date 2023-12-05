import * as Sentry from '@sentry/node';
import crypto from 'crypto';
import { generatePath } from 'react-router-dom';
import slugMe from 'slugme';
import { AppRoutes, Chapters } from '../../../universal/config';
import {
  apiSuccessResult,
  defaultDateFormat,
} from '../../../universal/helpers';
import { decrypt, encrypt } from '../../../universal/helpers/encrypt-decrypt';
import { LinkProps } from '../../../universal/types';
import { DataRequestConfig, getApiConfig } from '../../config';
import { requestData } from '../../helpers';
import { AuthProfileAndToken } from '../../helpers/app';
import { fetchService, fetchTipsAndNotifications } from './api-service';

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

interface ErfpachtDossierDetailNota {
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

interface ErfpachtDossierDetailToekomstigePeriode {
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

interface ErfpachtDossierDetailHuidigePeriodeCanon {
  canonBedrag: string;
  formattedCanonBedrag: string;
  canonBeginJaar: string;
  samengesteld: string;
}

interface ErfpachtDossierDetailHuidigePeriode {
  periodeVan: string;
  titelFinancieelPeriodeVan: string;
  periodeTm: string;
  algemeneBepaling: string;
  titelFinancieelAlgemeneBepaling: string;
  regime: string;
  titelFinancieelRegime: string;
  canons: ErfpachtDossierDetailHuidigePeriodeCanon[];
  titelFinancieelCanon: 'Canon';
}

interface ErfpachtDossierDetailKadastraleAanduiding {
  gemeenteCode: string;
  gemeenteNaam: string;
  sectie: string;
  perceelsnummer: 0;
  letter: string;
  volgnummer: 0;
  samengesteld: string;
}

interface ErfpachtDossierDetailRelatie {
  relatieNaam: string;
  betaler: boolean;
  indicatieGeheim: boolean;
}

interface ErfpachtDossierDetailJuridisch {
  ingangsdatum: string;
  titelIngangsdatum: string;
  algemeneBepaling: string;
  titelAlgemeneBepaling: string;
  soortErfpacht: string;
  uitgeschrevenSoortErfpacht: string;
  titelSoortErfpacht: string;
}

interface ErfpachtDossierDetailBestemming {
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

interface ErfpachtV2DossiersDetailSource {
  dossierNummer: string;
  titelDossierNummer: string;
  voorkeursadres: string;
  titelVoorkeursadres: string;
  kadastraleaanduiding: ErfpachtDossierDetailKadastraleAanduiding[];
  titelKadastraleaanduiding: string;
  eersteUitgifte: string;
  titelEersteUitgifte: string;
  relaties: ErfpachtDossierDetailRelatie[];
  titelBetaler: string;
  juridisch: ErfpachtDossierDetailJuridisch;
  bestemmingen: ErfpachtDossierDetailBestemming[];
  financieel: {
    huidigePeriode: ErfpachtDossierDetailHuidigePeriode;
    toekomstigePeriodeList: ErfpachtDossierDetailToekomstigePeriode[];
  };
  facturen: {
    betaler: string;
    debiteurnummer: string;
    notas: ErfpachtDossierDetailNota[];
  };
}

interface ErfpachtDossierPropsFrontend {
  id: string;
  slug: string;
  link: LinkProps;
  title: string;
}

export type ErfpachtV2DossiersDetail = ErfpachtV2DossiersDetailSource &
  ErfpachtDossierPropsFrontend;

interface ErfpachtV2DossiersSource {
  dossierNummer: string;
  titelDossierNummer: string;
  voorkeursadres: string;
  titelVoorkeursadres: string;
  titelZaaknummer: string;
  zaaknummer: string;
  titelWijzigingsAanvragen: string;
  wijzigingsAanvragen: string[];
}

interface ErfpachtV2DossiersResponseSource {
  titelDossiersKop: string;
  dossiers: ErfpachtV2DossiersSource[];
  titelOpenFacturenKop: string;
  openFacturen: ErfpachtDossierDetailNota[];
}

export type ErfpachtV2Dossiers = ErfpachtV2DossiersSource &
  ErfpachtDossierPropsFrontend;

interface ErfpachtV2DossiersResponse extends ErfpachtV2DossiersResponseSource {
  dossiers: ErfpachtV2Dossiers[];
}

function addErfpachtDossierPropertiesForFrontend<
  T extends ErfpachtV2DossiersSource | ErfpachtV2DossiersDetailSource,
>(dossier: T): T & ErfpachtDossierPropsFrontend {
  const slug = slugMe(dossier.dossierNummer);
  const [id] = encrypt(
    dossier.dossierNummer,
    process.env.BFF_GENERAL_ENCRYPTION_KEY ?? ''
  );
  const title = `${dossier.dossierNummer} - ${dossier.voorkeursadres}`;

  // Filter out relaties that we don't want to show in the frontend.
  if ('relaties' in dossier) {
    dossier.relaties = dossier.relaties.filter(
      (relatie) => relatie.indicatieGeheim === false
    );
  }

  return {
    ...dossier,
    id,
    slug,
    title,
    link: {
      to: generatePath(AppRoutes['ERFPACHTv2/DOSSIERDETAIL'], { id }),
      title,
    },
  };
}

function transformDossierResponse(response: ErfpachtV2DossiersResponse) {
  if (response?.dossiers?.length) {
    response.dossiers = response.dossiers.map((dossier) => {
      return addErfpachtDossierPropertiesForFrontend(dossier);
    });
  }
  if (response.openFacturen.length) {
    response.openFacturen = response.openFacturen.map((factuur) => {
      return {
        ...factuur,
        vervalDatum: defaultDateFormat(factuur.vervalDatum),
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

  const dossierInfoResponseEmpty_: ErfpachtV2DossiersResponse = {
    dossiers: [],
    openFacturen: [],
    titelDossiersKop: '',
    titelOpenFacturenKop: '',
  };

  const dossierInfoResponseEmpty = apiSuccessResult(dossierInfoResponseEmpty_);

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
      return requestData<ErfpachtV2DossiersResponse>(
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

export async function fetchErfpachtV2DossiersDetail(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  dossierNummerEncrypted: string
) {
  const config = getApiConfig('ERFPACHTv2');
  const dossierNummer = decrypt(
    dossierNummerEncrypted,
    process.env.BFF_GENERAL_ENCRYPTION_KEY ?? ''
  );
  const dossierInfoResponse = await requestData<ErfpachtV2DossiersDetail>(
    {
      ...config,
      url: `${config.url}/vernise/api/dossierinfo/${dossierNummer}`,
      transformResponse: addErfpachtDossierPropertiesForFrontend,
    },
    requestID
  );

  return dossierInfoResponse;
}
