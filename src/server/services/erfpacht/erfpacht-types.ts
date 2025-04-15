import { LinkProps, ZaakDetail } from '../../../universal/types/App.types';

export interface ErfpachtErpachterResponseSource {
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

export interface ErfpachtErpachterResponse {
  isKnown: boolean;
  relatieCode: ErfpachtErpachterResponseSource['relationCode'];
  profileType: ProfileType;
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

export interface ErfpachtDossiersDetailSource {
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
  titelKadastraleAanduiding: string;
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

export type ErfpachtDossierPropsFrontend = ZaakDetail & {
  dossierNummerUrlParam: string;
  link: LinkProps;
  title: string;
};

export type ErfpachtDossiersDetail = ErfpachtDossiersDetailSource &
  ErfpachtDossierPropsFrontend;

export interface ErfpachtDossierSource {
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

export interface ErfpachtDossiersResponseSource {
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
