// ==============================================
// API SOURCE TYPES
// ===============================================

type DatumAanvangMaatschappelijkeActiviteitSource = {
  datumAanvangMaatschappelijkeActiviteitDatum: string;
  datumAanvangMaatschappelijkeActiviteitJaar: string;
  datumAanvangMaatschappelijkeActiviteitMaand: string;
  datumAanvangMaatschappelijkeActiviteitDag: string;
};

type DatumAanvangOnderneming = {
  datumAanvangOndernemingDatum: string;
  datumAanvangOndernemingJaar: string;
  datumAanvangOndernemingMaand: string;
  datumAanvangOndernemingDag: string;
};

type DatumEindeOnderneming = {
  datumEindeOndernemingDatum: string;
  datumEindeOndernemingJaar: string;
  datumEindeOndernemingMaand: string;
  datumEindeOndernemingDag: string;
};

type DatumEindeMaatschappelijkeActiviteitSource = {
  datumEindeMaatschappelijkeActiviteitDatum: string;
  datumEindeMaatschappelijkeActiviteitJaar: string;
  datumEindeMaatschappelijkeActiviteitMaand: string;
  datumEindeMaatschappelijkeActiviteitDag: string;
};

export type DatumNormalizedSource = {
  datum: string;
  jaar: string;
  maand: string;
  dag: string;
};

type ActiviteitSource = {
  sbiCode: string;
  omschrijving: string;
  isHoofdactiviteit: boolean;
};

type HandelsnaamSource = {
  datumAanvang: string;
  datumEinde: string;
  handelsnaam: string;
  volgorde: string;
};

type CommunicatieSource = {
  toegangscode: string;
  nummer: string;
  soort: string;
};

type BezoekLocatieSource = {
  bezoekLocatieAfgeschermd: boolean;
  bezoekLocatieToevoegingAdres: string;
  bezoekLocatieVolledigAdres: string;
  bezoekLocatieStraatnaam: string;
  bezoekLocatieHuisnummer: string;
  bezoekLocatieHuisletter: string;
  bezoekLocatieHuisnummerToevoeging: string;
  bezoekLocatiePostcode: string;
  bezoekLocatiePlaats: string;
  bezoekLocatieStraatHuisnummerBuitenland: string;
  bezoekLocatiePostcodePlaatsBuitenland: string;
  bezoekLocatieRegioBuitenland: string;
  bezoekLocatieLandBuitenland: string;
};

type PostLocatieSource = {
  postLocatieAfgeschermd: boolean;
  postLocatieToevoegingAdres: string;
  postLocatieVolledigAdres: string;
  postLocatieStraatnaam: string;
  postLocatieHuisnummer: string;
  postLocatieHuisletter: string;
  postLocatieHuisnummerToevoeging: string;
  postLocatiePostbusnummer: string;
  postLocatiePostcode: string;
  postLocatiePlaats: string;
  postLocatieStraatHuisnummerBuitenland: string;
  postLocatiePostcodePlaatsBuitenland: string;
  postLocatieRegioBuitenland: string;
  postLocatieLandBuitenland: string;
};

type BagLocatie = {
  identificatie: string;
  volgnummer: string;
};

export type MaatschappelijkeActiviteitSource = {
  kvknummer: string;
  datumAanvangMaatschappelijkeActiviteit: DatumAanvangMaatschappelijkeActiviteitSource;
  datumEindeMaatschappelijkeActiviteit: DatumEindeMaatschappelijkeActiviteitSource;
  registratieTijdstipMaatschappelijkeActiviteit: string;
  naam: string;
  nonMailing: boolean;
  activiteiten: ActiviteitSource[];
  heeftHrHoofdvestiging: { vestigingsnummer: string };
  heeftAlsEigenaarHrNps: { identificatie: string };
  heeftAlsEigenaarHrNnp: { identificatie: string };
  onderneming: boolean;
  totaalWerkzamePersonen: number;
  datumAanvangOnderneming: DatumAanvangOnderneming;
  datumEindeOnderneming: DatumEindeOnderneming;
  wordtUitgeoefendInCommercieleHrVestigingen: string;
  wordtUitgeoefendInNietCommercieleHrVestigingen: string;
  handelsnamen: HandelsnaamSource[];
  communicatie: CommunicatieSource[];
  emailAdressen: Array<{ emailAdres: string }>;
  domeinnamen: Array<{ domeinnaam: string }>;
  bezoekLocatie: BezoekLocatieSource;
  bezoekHeeftBagNummeraanduiding: BagLocatie;
  bezoekHeeftBagVerblijfsobject: BagLocatie;
  bezoekHeeftBagLigplaats: BagLocatie;
  bezoekHeeftBagStandplaats: BagLocatie;
  postLocatie: PostLocatieSource;
};

export type VestigingSource = {
  vestigingsnummer: string;
  datumAanvangDatum: string | null;
  datumAanvangJaar: number;
  datumAanvangMaand: number;
  datumAanvangDag: number;
  datumEindeDatum: string | null;
  datumEindeJaar: number | null;
  datumEindeMaand: number | null;
  datumEindeDag: number | null;
  datumVoortzettingDatum: string | null;
  datumVoortzettingJaar: number | null;
  datumVoortzettingMaand: number | null;
  datumVoortzettingDag: number | null;
  isCommercieleVestiging: 'Nee' | 'Ja';
  eersteHandelsnaam: string;
  hoofdvestiging: 'Nee' | 'Ja';
  activiteitOmschrijving: string;
  bezoekLocatieVolledigAdres: string;
  bezoekHeeftBagNummeraanduidingId: string | null;
  bezoekHeeftBagLigplaatsId: string | null;
  bezoekHeeftBagStandplaatsId: string | null;
  postLocatieVolledigAdres: string | null;
  postHeeftBagNummeraanduidingId: string | null;
  postHeeftBagVerblijfsobjectId: string | null;
  postHeeftBagLigplaatsId: string | null;
  postHeeftBagStandplaatsId: string | null;
  communicatie: Array<{
    toegangscode: string | null;
    nummer: string | null;
    soort: string | null;
  }>;
  emailAdressen: Array<{ emailAdres: string | null }>;
  domeinnamen: Array<{
    domeinnaam: string | null;
  }>;
  activiteiten: Array<{
    sbiCode: string | null;
    omschrijving: string | null;
    isHoofdactiviteit: 'Ja' | 'Nee';
  }>;
  handelsnamen: Array<{
    handelsnaam: string | null;
  }>;
};

export type NietNatuurlijkPersoonSource = {
  identificatie: string;
  rechtsvorm: string;
  rol: string;
  rsin: string;
  typePersoon: string;
  uitgebreideRechtsvorm: string;
  volledigeNaam: string;
  naam: string;
};

export type NatuurlijkPersoonSource = {
  bsn: string;
  identificatie: string;
  persoonRechtsvorm: string;
  rol: string;
  typePersoon: string;
  uitgebreideRechtsvorm: string;
  volledigeNaam: string;
};

export type ApiResponseEnvelope<T, K extends string> = {
  _embedded: {
    [key in K]: T[];
  };
};

export type MACResponseSource = Prettify<
  ApiResponseEnvelope<
    MaatschappelijkeActiviteitSource,
    'maatschappelijkeactiviteiten'
  > &
    ApiResponseEnvelope<NietNatuurlijkPersoonSource, 'heeftAlsEigenaarHrNnp'> &
    ApiResponseEnvelope<NatuurlijkPersoonSource, 'heeftAlsEigenaarHrNps'>
>;

// ==============================================
// FRONTEND TYPES
// ===============================================

type Rechtsvorm = string;

export type Onderneming = {
  handelsnaam: string | null;
  handelsnamen: string[] | null;
  rechtsvorm: Rechtsvorm;
  hoofdactiviteit: string;
  overigeActiviteiten: string[] | null;
  datumAanvang: string;
  datumEinde: string | null;
  kvknummer: string;
};

export type NietNatuurlijkPersoon = {
  naam: string | null;
  rsin?: string;
  kvknummer?: string;
  statutaireZetel?: string;
};

export type NatuurlijkPersoon = {
  naam: string | null;
  geboortedatum: string | null;
};

export type Vestiging = {
  vestigingsNummer: string;
  handelsnamen: string[];
  eersteHandelsnaam: string | null;
  typeringVestiging: string;
  bezoekadres: string | null;
  postadres: string | null;
  telefoonnummer: string | null;
  websites: string[] | null;
  faxnummer: string | null;
  emailadres: string | null;
  activiteiten: string[];
  datumAanvang: string | null;
  datumEinde: string | null;
  isHoofdvestiging?: boolean;
};

export type KvkResponseFrontend = {
  mokum: boolean;
  onderneming: Onderneming | null;
  vestigingen: Vestiging[];
  eigenaar: NatuurlijkPersoon | NietNatuurlijkPersoon | null;
};

export type MACResponse = {
  onderneming: Onderneming;
  eigenaar: NatuurlijkPersoon | NietNatuurlijkPersoon;
};
