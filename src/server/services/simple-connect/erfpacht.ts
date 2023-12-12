import crypto from 'crypto';
import { generatePath } from 'react-router-dom';
import { AppRoutes, Chapters } from '../../../universal/config';
import { defaultDateFormat } from '../../../universal/helpers';
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

interface ErfpachtDossierFactuur {
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
}

interface ErfpachtDossierDetailToekomstigePeriode {
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

interface ErfpachtCanon {
  canonBedrag: string;
  formattedCanonBedrag: string;
  canonBeginJaar: string;
  samengesteld: string;
}

interface ErfpachtDossierDetailHuidigePeriode {
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
    debiteurnummer: string;
    titelDebiteurnummer: string;
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

interface ErfpachtDossierPropsFrontend {
  dossierNummerUrlParam: string;
  link: LinkProps;
  title: string;
}

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

interface ErfpachtV2DossiersResponse extends ErfpachtV2DossiersResponseSource {
  dossiers: ErfpachtV2DossiersResponseSource['dossiers'] & {
    dossiers?: ErfpachtV2Dossier[];
  };
  isKnown: boolean;
}

function transformErfpachtDossierProperties<
  T extends ErfpachtV2DossierSource | ErfpachtV2DossiersDetailSource,
>(dossier: T): T & ErfpachtDossierPropsFrontend {
  const dossierNummerUrlParam = `E${dossier.dossierNummer
    .split(/E|\//)
    .join('.')}`;
  const title = `${dossier.dossierNummer} - ${dossier.voorkeursadres}`;

  // Filter out relaties that we don't want to show in the frontend.
  if ('relaties' in dossier && !!dossier.relaties) {
    dossier.relaties = dossier.relaties.filter(
      (relatie) => relatie.indicatieGeheim === false
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
      return factuur;
    });
  }

  if (
    'financieel' in dossier &&
    !!dossier.financieel?.huidigePeriode.periodeSamengesteld
  ) {
    dossier.financieel.huidigePeriode.periodeSamengesteld = `${defaultDateFormat(
      dossier.financieel.huidigePeriode.periodeVan
    )} t/m ${
      dossier.financieel.huidigePeriode.periodeTm
        ? `${defaultDateFormat(dossier.financieel.huidigePeriode.periodeTm)}`
        : '-'
    }`;
  }

  return {
    ...dossier,
    dossierNummerUrlParam,
    title,
    link: {
      to: generatePath(AppRoutes['ERFPACHTv2/DOSSIERDETAIL'], {
        dossierNummerUrlParam,
      }),
      title,
    },
  };
}

function transformDossierResponse(response: ErfpachtV2DossiersResponse) {
  const hasDossiers = response?.dossiers?.dossiers?.length;
  if (hasDossiers) {
    response.dossiers.dossiers = response.dossiers?.dossiers.map((dossier) => {
      return transformErfpachtDossierProperties(dossier);
    });
  }

  if (response?.openstaandeFacturen?.facturen?.length) {
    response.openstaandeFacturen.facturen =
      response.openstaandeFacturen?.facturen.map((factuur) => {
        return {
          ...factuur,
          vervalDatum: defaultDateFormat(factuur.vervalDatum),
        };
      });
  }

  if (hasDossiers) {
    response.isKnown = true;
  }

  return response;
}

export async function fetchErfpachtV2(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const config = getApiConfig('ERFPACHTv2');

  if (authProfileAndToken.profile.profileType === 'commercial') {
    return requestData<ErfpachtV2DossiersResponse | { isKnown: boolean }>(
      {
        ...config,
        url: `${config.url}/vernise/api/erfpachter`,
        transformResponse: transformIsErfpachterResponseSource,
      },
      requestID,
      authProfileAndToken
    );
  }

  return requestData<ErfpachtV2DossiersResponse>(
    {
      ...config,
      url: `${config.url}/vernise/api/dossierinfo`,
      transformResponse: transformDossierResponse,
    },
    requestID,
    authProfileAndToken
  );
}

export async function fetchErfpachtV2DossiersDetail(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  dossierNummerUrlParam: string
) {
  const config = getApiConfig('ERFPACHTv2');
  const dossierInfoResponse = await requestData<ErfpachtV2DossiersDetail>(
    {
      ...config,
      url: `${config.url}/vernise/api/dossierinfo/${dossierNummerUrlParam}`,
      transformResponse: transformErfpachtDossierProperties,
    },
    requestID,
    authProfileAndToken
  );

  return dossierInfoResponse;
}
