import crypto from 'crypto';

import { generatePath } from 'react-router-dom';

import { fetchService, fetchTipsAndNotifications } from './api-service';
import { FeatureToggle } from '../../../universal/config/feature-toggles';
import { AppRoutes } from '../../../universal/config/routes';
import { Themas } from '../../../universal/config/thema';
import { apiPostponeResult } from '../../../universal/helpers/api';
import { defaultDateFormat } from '../../../universal/helpers/date';
import { jsonCopy, sortAlpha } from '../../../universal/helpers/utils';
import { LinkProps, ZaakDetail } from '../../../universal/types';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { DataRequestConfig } from '../../config/source-api';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';

function encryptPayload(payload: string) {
  const encryptionKey = process.env.BFF_MIJN_ERFPACHT_ENCRYPTION_KEY_V2 + '';
  const IV_LENGTH = 16;
  const iv = crypto
    .randomBytes(IV_LENGTH)
    .toString('base64')
    .slice(0, IV_LENGTH);
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
  requestID: RequestID
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
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  if (!FeatureToggle.mijnErfpachtActive) {
    return Promise.resolve(apiPostponeResult(null));
  }

  return fetchService(
    requestID,
    getConfigMain(authProfileAndToken, requestID),
    false
  );
}

function getConfigNotifications(
  authProfileAndToken: AuthProfileAndToken,
  requestID: RequestID
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
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  if (!FeatureToggle.mijnErfpachtActive) {
    return Promise.resolve(apiPostponeResult(null));
  }
  const response = await fetchTipsAndNotifications(
    requestID,
    getConfigNotifications(authProfileAndToken, requestID),
    Themas.ERFPACHT
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
  relatieCode: Erfpachtv2ErpachterResponseSource['relationCode'];
  profileType: ProfileType;
}

function transformIsErfpachterResponseSource(
  responseData: Erfpachtv2ErpachterResponseSource,
  profileType: ProfileType
): Erfpachtv2ErpachterResponse {
  return {
    isKnown: !!responseData?.erfpachter,
    relatieCode: responseData?.relationCode,
    profileType,
  };
}

export interface ErfpachtDossierFactuur {
  dossierAdres: string;
  titelFacturenDossierAdres: string;
  status: string;
  titelFacturenStatus: string;
  stopcode: string;
  open: boolean;
  factuurNummer: string;
  titelFacturenNummer: string;
  factuurBedrag: string;
  formattedFactuurBedrag: string;
  titelFacturenFactuurBedrag: string;
  openstaandBedrag: string;
  formattedOpenstaandBedrag: string;
  titelFacturenOpenstaandBedrag: string;
  vervalDatum: string;
  titelFacturenVervaldatum: string;

  // Added
  dossierNummerUrlParam: string;
}

export interface ErfpachtDossierDetailToekomstigePeriode {
  periodeVan: string;
  titelFinancieelToekomstigePeriodeVan: string;
  periodeTm: string;
  periodeSamengesteld: string;
  algemeneBepaling: string;
  titelFinancieelToekomstigeAlgemeneBepaling: string;
  regime: string;
  titelFinancieelToekomstigeRegime: string;
  afgekocht: string;
  titelAfgekocht: string;
  betalenVanaf: string;
  titelBetalenVanaf: string;
  canons?: ErfpachtCanon[];
  titelFinancieelToekomstigeCanon: string;
}

export interface ErfpachtCanon {
  canonBedrag: string;
  formattedCanonBedrag: string;
  canonBeginJaar: string;
  samengesteld: string;
}

export interface ErfpachtDossierDetailHuidigePeriode {
  periodeVan: string;
  titelFinancieelPeriodeVan: string;
  periodeTm: string;
  periodeSamengesteld: string;
  algemeneBepaling: string;
  titelFinancieelAlgemeneBepaling: string;
  regime: string;
  titelFinancieelRegime: string;
  afgekocht: string;
  titelAfgekocht: string;
  titelGeenCanon: string;
  canons?: ErfpachtCanon[];
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
  relatieCode: string;
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

interface ErfpachtDossierDetailBijzondereBepaling {
  omschrijving: string;
  titelBestemmingOmschrijving: string;
  categorie: string;
  oppervlakte: number;
  titelOppervlakte: string;
  eenheid: string;
  samengesteldeOppervlakteEenheid: string;
}

interface ErfpachtV2DossiersDetailSource {
  dossierNummer: string;
  titelDossierNummer: string;
  eersteUitgifte: string;
  titelEersteUitgifte: string;
  voorkeursadres: string;
  titelVoorkeursadres: string;
  titelKopVastgoed: string;
  titelKopErfpachter: string;
  titelKopJuridisch: string;
  titelKopBijzondereBepalingen: string;
  titelKopFinancieel: string;
  titelKopFacturen: string;
  kadastraleaanduidingen?: ErfpachtDossierDetailKadastraleAanduiding[];
  titelKadastraleaanduiding: string;
  relaties?: ErfpachtDossierDetailRelatie[];
  titelBetaler: string;
  juridisch?: ErfpachtDossierDetailJuridisch;
  bijzondereBepalingen?: ErfpachtDossierDetailBijzondereBepaling[];
  financieel?: {
    huidigePeriode: ErfpachtDossierDetailHuidigePeriode;
    toekomstigePeriodeList: ErfpachtDossierDetailToekomstigePeriode[];
  };
  facturen: {
    betaler: string;
    titelBetaler: string;
    debiteurNummer: string;
    titelDebiteurNummer: string;
    titelFacturen: string;
    titelVerklarendeTekstFacturen: string;
    titelVerklarendeTekstFacturen2: string;
    titelFactuurZoekveld: string;
    titelFacturenDossierAdres: string;
    titelFacturenStatus: string;
    titelFacturenNummer: string;
    titelFacturenFactuurBedrag: string;
    titelFacturenOpenstaandBedrag: string;
    titelFacturenVervaldatum: string;
    titelResultatenGevonden: string;
    titelGeenResultatenGevonden: string;
    titelFactuurHelpTekstRegel1: string;
    facturen?: ErfpachtDossierFactuur[];
  };
}

type ErfpachtDossierPropsFrontend = ZaakDetail & {
  dossierNummerUrlParam: string;
  link: LinkProps;
  title: string;
};

export type ErfpachtV2DossiersDetail = ErfpachtV2DossiersDetailSource &
  ErfpachtDossierPropsFrontend;

interface ErfpachtV2DossierSource {
  dossierNummer: string;
  titelDossierNummer: string;
  voorkeursadres: string;
  titelVoorkeursadres: string;
  titelZaaknummer: string;
  zaaknummer: string;
  titelWijzigingsAanvragen: string;
  wijzigingsAanvragen: string[];
  titelResultatenGevonden: string;
  titelGeenResultatenGevonden: string;
  titelDossierZoekveld: string;
  titelDossierHelpTekstRegel1: string;
  titelDossierHelpTekstRegel2: string;
}

interface ErfpachtV2DossiersResponseSource {
  titelStartPaginaKop: string;
  titelVerklarendeTekstStartPagina: string;
  titelLinkErfpachtrechten: string;
  titelDossiersKop: string;
  dossiers?: {
    dossiers: ErfpachtV2DossierSource[];
    titelDossiernummer: string;
    titelVoorkeursAdres: string;
    titelZaakNummer: string;
    titelWijzigingsAanvragen: string;
    titelResultatenGevonden: string;
    titelGeenResultatenGevonden: string;
    titelDossierZoekveld: string;
    titelDossierHelpTekstRegel1: string;
    titelDossierHelpTekstRegel2: string;
  };
  titelOpenFacturenKop: string;
  titelLinkFacturen: string;
  openstaandeFacturen?: {
    betaler: string;
    titelBetaler: string;
    debiteurnummer: string;
    titelDebiteurNummer: string;
    titelFacturen: string;
    titelVerklarendeTekstFacturen: string;
    titelVerklarendeTekstFacturen2: string;
    titelFactuurZoekveld: string;
    titelFacturenDossierAdres: string;
    titelFacturenStatus: string;
    titelFacturenNummer: string;
    titelFacturenFactuurBedrag: string;
    titelFacturenOpenstaandBedrag: string;
    titelFacturenVervaldatum: string;
    titelResultatenGevonden: string;
    titelGeenResultatenGevonden: string;
    titelFactuurHelpTekstRegel1: string;
    facturen?: ErfpachtDossierFactuur[];
  };
}

export type ErfpachtV2Dossier = ErfpachtV2DossierSource &
  ErfpachtDossierPropsFrontend;

export interface ErfpachtV2DossiersResponse
  extends ErfpachtV2DossiersResponseSource {
  dossiers: ErfpachtV2DossiersResponseSource['dossiers'] & {
    dossiers?: ErfpachtV2Dossier[];
  };
  openstaandeFacturen: ErfpachtV2DossiersResponseSource['openstaandeFacturen'] & {
    dossiers: ErfpachtDossierFactuur[];
  };
  isKnown: boolean;
  relatieCode: string;
}

function getDossierNummerUrlParam(dossierNummer: string) {
  return `E${dossierNummer.split(/E|\//).join('.')}`;
}

export function transformErfpachtDossierProperties<
  T extends ErfpachtV2DossierSource | ErfpachtV2DossiersDetailSource,
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
    id: dossierNummerUrlParam,
    link: {
      to: generatePath(AppRoutes['ERFPACHTv2/DOSSIERDETAIL'], {
        dossierNummerUrlParam,
      }),
      title,
    },
  });

  return zaak;
}

export function transformDossierResponse(
  responseDataSource: ErfpachtV2DossiersResponse,
  relatieCode: Erfpachtv2ErpachterResponseSource['relationCode']
) {
  const responseData: ErfpachtV2DossiersResponse = responseDataSource
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

export async function fetchErfpachtV2(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const config = getApiConfig('ERFPACHTv2');

  const erfpachterResponse = await requestData<Erfpachtv2ErpachterResponse>(
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
    return requestData<ErfpachtV2DossiersResponse>(
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

export async function fetchErfpachtV2DossiersDetail(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken,
  dossierNummerUrlParam: string
) {
  const config = getApiConfig('ERFPACHTv2');
  const dossierInfoResponse = await requestData<ErfpachtV2DossiersDetail>(
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
