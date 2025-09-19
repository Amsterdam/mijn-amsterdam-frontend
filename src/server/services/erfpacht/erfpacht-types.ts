import { ZaakAanvraagDetail } from '../../../universal/types/App.types';

export type ErfpachtErpachterResponseSource = {
  erfpachter: boolean;
  relationID: string;
  relationCode: string;
  name: string;
  email: string;
  phoneNumber: string;
  aantalRechten: 0;
  laatsteMutatieDatum: string;
  businessType: string;
};

export type ErfpachtErpachterResponse = {
  isKnown: boolean;
  relatieCode: ErfpachtErpachterResponseSource['relationCode'];
  profileType: ProfileType;
  url?: string;
};

export type ErfpachtDossierFactuur = {
  dossierAdres: string;
  titelFacturenDossierAdres: string;
  status: string;
  titelFacturenStatus: string;
  stopcode?: string;
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
};

export type ErfpachtDossierDetailToekomstigePeriode = {
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
};

export type ErfpachtCanon = {
  canonBedrag: string;
  formattedCanonBedrag: string;
  canonBeginJaar: string;
  samengesteld: string;
};

export type ErfpachtDossierDetailHuidigePeriode = {
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
  titelFinancieelCanon: string;
};

export type ErfpachtDossierDetailKadastraleAanduiding = {
  gemeenteCode: string;
  gemeenteNaam: string;
  sectie: string;
  perceelnummer: string;
  letter: string;
  volgnummer: string;
  samengesteld: string;
};

export type ErfpachtDossierDetailRelatie = {
  relatieNaam: string;
  betaler: boolean;
  indicatieGeheim: boolean;
  relatieCode: string;
};

export type ErfpachtDossierDetailJuridisch = {
  ingangsdatum: string;
  titelIngangsdatum: string;
  algemeneBepaling: string;
  titelAlgemeneBepaling: string;
  soortErfpacht: string;
  uitgeschrevenSoortErfpacht: string;
  titelSoortErfpacht: string;
};

export type ErfpachtDossierDetailBijzondereBepaling = {
  omschrijving: string;
  titelBestemmingOmschrijving: string;
  categorie: string;
  oppervlakte: string;
  titelOppervlakte: string;
  eenheid: string;
  samengesteldeOppervlakteEenheid: string;
};

export type ErfpachtDossiersDetailSource = {
  dossierNummer: string | undefined;
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
    huidigePeriode?: ErfpachtDossierDetailHuidigePeriode;
    toekomstigePeriodeList?: ErfpachtDossierDetailToekomstigePeriode[];
  };
  facturen: {
    betaler: string;
    titelBetaler: string;
    debiteurNummer: string;
    titelDebiteurNummer: string;
    titelFacturen: string;
    titelVerklarendeTekstFacturen: string;
    titelVerklarendeTekstFacturen2?: string;
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
};

export type ErfpachtDossierPropsFrontend<
  T extends ErfpachtDossierSource | ErfpachtDossiersDetailSource,
> = T &
  Omit<ZaakAanvraagDetail, 'displayStatus' | 'steps'> & {
    dossierNummerUrlParam: string | null;
  };

export type ErfpachtDossiersDetail =
  ErfpachtDossierPropsFrontend<ErfpachtDossiersDetailSource>;

export type ErfpachtDossierSource = {
  dossierNummer: string;
  titelDossiernummer: string;
  voorkeursadres: string;
  titelVoorkeursAdres: string;
  titelZaaknummer: string;
  zaaknummer?: string;
  titelWijzigingsAanvragen?: string;
  wijzigingsAanvragen?: string[];
  titelResultatenGevonden: string;
  titelGeenResultatenGevonden: string;
  titelDossierZoekveld: string;
  titelDossierHelpTekstRegel1: string;
  titelDossierHelpTekstRegel2: string;
};

export type ErfpachtDossiersResponseSource = {
  titelStartPaginaKop: string;
  titelVerklarendeTekstStartPagina: string;
  titelLinkErfpachtrechten: string;
  titelDossiersKop: string;
  dossiers?: {
    dossiers: ErfpachtDossierSource[];
    titelDossiernummer: string;
    titelVoorkeursAdres: string;
    titelZaaknummer: string;
    titelWijzigingsAanvragen?: string;
    titelResultatenGevonden: string;
    titelGeenResultatenGevonden: string;
    titelDossierZoekveld: string;
    titelDossierHelpTekstRegel1: string;
    titelDossierHelpTekstRegel2: string;
  };
  titelOpenFacturenKop: string;
  titelLinkFacturen: string;
  openstaandeFacturen?: {
    betaler?: string;
    titelBetaler: string;
    debiteurnummer?: string;
    titelDebiteurNummer: string;
    titelFacturen: string;
    titelVerklarendeTekstFacturen: string;
    titelVerklarendeTekstFacturen2?: string;
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
};

export type ErfpachtDossierFrontend =
  ErfpachtDossierPropsFrontend<ErfpachtDossierSource>;

export type ErfpachtDossierFactuurFrontend = ErfpachtDossierFactuur & {
  dossierNummerUrlParam: string | null;
};

export type ErfpachtDossiersResponse = ErfpachtDossiersResponseSource & {
  dossiers: ErfpachtDossiersResponseSource['dossiers'] & {
    dossiers?: ErfpachtDossierFrontend[];
  };
  openstaandeFacturen: ErfpachtDossiersResponseSource['openstaandeFacturen'] & {
    facturen: ErfpachtDossierFactuurFrontend[];
  };
  isKnown: boolean;
  relatieCode: string;
};
