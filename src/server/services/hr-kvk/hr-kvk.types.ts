// ==============================================
// API SOURCE TYPES
// ===============================================

type DatumAanvangMaatschappelijkeActiviteitSource = {
  datumAanvangMaatschappelijkeActiviteitDatum: string;
  datumAanvangMaatschappelijkeActiviteitJaar: string;
  datumAanvangMaatschappelijkeActiviteitMaand: string;
  datumAanvangMaatschappelijkeActiviteitDag: string;
};

type DatumEindeMaatschappelijkeActiviteitSource = {
  datumEindeMaatschappelijkeActiviteitDatum: string;
  datumEindeMaatschappelijkeActiviteitJaar: string;
  datumEindeMaatschappelijkeActiviteitMaand: string;
  datumEindeMaatschappelijkeActiviteitDag: string;
};

export type DateSource = {
  datum: string | null;
  jaar: string | null;
  maand: string | null;
  dag: string | null;
};

type ActiviteitSource = {
  omschrijving: string;
  isHoofdactiviteit: boolean;
};

type HandelsnaamSource = {
  handelsnaam: string;
  volgorde: string;
};

type CommunicatieSource = {
  nummer: string;
  soort: string;
};

export type MaatschappelijkeActiviteitSource = {
  kvknummer: string;
  datumAanvangMaatschappelijkeActiviteit: DatumAanvangMaatschappelijkeActiviteitSource;
  datumEindeMaatschappelijkeActiviteit: DatumEindeMaatschappelijkeActiviteitSource;
  naam: string;
  activiteiten: ActiviteitSource[];
  handelsnamen: HandelsnaamSource[];
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
  naam: string | null;
  eersteHandelsnaam: string | null;
  hoofdvestiging: 'Nee' | 'Ja';
  bezoekLocatieVolledigAdres: string;
  bezoekHeeftBagNummeraanduidingId: string | null;
  bezoekHeeftBagLigplaatsId: string | null;
  bezoekHeeftBagStandplaatsId: string | null;
  postLocatieVolledigAdres: string | null;
  postHeeftBagNummeraanduidingId: string | null;
  postHeeftBagLigplaatsId: string | null;
  postHeeftBagStandplaatsId: string | null;
  communicatie: CommunicatieSource[];
  emailAdressen: Array<{ emailAdres: string | null }> | null;
  domeinnamen: Array<{
    domeinnaam: string | null;
  }> | null;
  activiteiten: ActiviteitSource[] | null;
  handelsnamen: HandelsnaamSource[] | null;
};

export type NietNatuurlijkPersoonSource = {
  rechtsvorm: string;
  rsin: string;
  typePersoon: string;
  uitgebreideRechtsvorm: string;
  volledigeNaam: string;
  naam: string;
};

export type NatuurlijkPersoonSource = {
  bsn: string;
  persoonRechtsvorm: string;
  typePersoon: string;
  uitgebreideRechtsvorm: string;
  volledigeNaam: string;
};

export type ApiResponseEnvelope<T, K extends string> = {
  _embedded?: {
    [key in K]?: T[];
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

export type VestigingenResponseSource = ApiResponseEnvelope<
  VestigingSource,
  'vestigingen'
>;

// ==============================================
// FRONTEND TYPES
// ===============================================

type Rechtsvorm = string;

export type Onderneming = {
  handelsnaam: string | null;
  handelsnamen: string[];
  rechtsvorm: Rechtsvorm;
  hoofdactiviteit: string;
  overigeActiviteiten: string[];
  datumAanvang: string | null;
  datumAanvangFormatted: string | null;
  datumEinde: string | null;
  datumEindeFormatted: string | null;
  kvknummer: string;
};

export type NietNatuurlijkPersoon = {
  naam: string | null;
  rsin?: string;
  typePersoon?: string;
};

export type NatuurlijkPersoon = {
  naam: string | null;
  typePersoon?: string;
};

export type Vestiging = {
  vestigingsNummer: string;
  naam: string | null;
  handelsnamen: string[];
  bezoekadres: string | null;
  postadres: string | null;
  telefoonnummer: string[];
  websites: string[];
  faxnummer: string[];
  emailadres: string[];
  activiteiten: string[];
  datumAanvang: string | null;
  datumAanvangFormatted: string | null;
  datumEinde: string | null;
  datumEindeFormatted: string | null;
  isHoofdvestiging?: boolean;
  postHeeftBagNummeraanduidingId: string | null;
  postHeeftBagLigplaatsId: string | null;
  postHeeftBagStandplaatsId: string | null;
  bezoekHeeftBagNummeraanduidingId: string | null;
  bezoekHeeftBagLigplaatsId: string | null;
  bezoekHeeftBagStandplaatsId: string | null;
};

export type KvkResponseFrontend = {
  mokum: boolean;
  onderneming: Onderneming | null;
  vestigingen: Vestiging[];
  eigenaar: NatuurlijkPersoon | NietNatuurlijkPersoon | null;
  kvkTranslation?: { from: string; to: string };
};

export type MACResponse = {
  onderneming: Onderneming | null;
  eigenaar: NatuurlijkPersoon | NietNatuurlijkPersoon | null;
};

export type KVKNummer = MaatschappelijkeActiviteitSource['kvknummer'];
