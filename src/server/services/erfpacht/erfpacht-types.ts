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

export type DossiersBaseSource = {
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

export type ErfpachtDossiersResponseSource = {
  titelStartPaginaKop: string;
  titelVerklarendeTekstStartPagina: string;
  titelLinkErfpachtrechten: string;
  titelDossiersKop: string;
  dossiers?: DossiersBaseSource;
};

export type ErfpachtDossierFrontend = ErfpachtDossierPropsFrontend<
  ErfpachtDossierSource | ErfpachtDossiersDetailSource
>;

export type ErfpachtDossiersResponse = Prettify<
  Omit<ErfpachtDossiersResponseSource, 'dossiers'> & {
    dossiers: Omit<DossiersBaseSource, 'dossiers'> & {
      dossiers: ErfpachtDossierFrontend[];
    };
    isKnown: boolean;
    relatieCode: string;
  }
>;
