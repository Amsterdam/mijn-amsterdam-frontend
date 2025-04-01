import { generatePath } from 'react-router-dom';

import { AppRoutes } from '../../../universal/config/routes';
import { defaultDateFormat } from '../../../universal/helpers/date';
import { jsonCopy, sortAlpha } from '../../../universal/helpers/utils';
import { LinkProps, ZaakDetail } from '../../../universal/types';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';

interface ErfpachtErpachterResponseSource {
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

interface ErfpachtErpachterResponse {
  isKnown: boolean;
  relatieCode: ErfpachtErpachterResponseSource['relationCode'];
  profileType: ProfileType;
}

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

interface ErfpachtDossiersDetailSource {
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

export type ErfpachtDossiersDetail = ErfpachtDossiersDetailSource &
  ErfpachtDossierPropsFrontend;

interface ErfpachtDossierSource {
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

interface ErfpachtDossiersResponseSource {
  titelStartPaginaKop: string;
  titelVerklarendeTekstStartPagina: string;
  titelLinkErfpachtrechten: string;
  titelDossiersKop: string;
  dossiers?: {
    dossiers: ErfpachtDossierSource[];
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

export type ErfpachtDossier = ErfpachtDossierSource &
  ErfpachtDossierPropsFrontend;

export interface ErfpachtDossiersResponse
  extends ErfpachtDossiersResponseSource {
  dossiers: ErfpachtDossiersResponseSource['dossiers'] & {
    dossiers?: ErfpachtDossier[];
  };
  openstaandeFacturen: ErfpachtDossiersResponseSource['openstaandeFacturen'] & {
    dossiers: ErfpachtDossierFactuur[];
  };
  isKnown: boolean;
  relatieCode: string;
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
