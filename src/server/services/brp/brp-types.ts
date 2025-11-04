type TyperingSource = {
  code: string;
  omschrijving: string;
};

type NaamSource = {
  aanduidingNaamgebruik: TyperingSource;
  adellijkeTitelPredicaat: TyperingSource & { soort: 'predicaat' | 'titel' };
  voornamen: string;
  voorvoegsel: string;
  geslachtsnaam: string;
  voorletters: string;
  volledigeNaam: string;
};

type NationaliteitSource = {
  type: string;
  datumIngangGeldigheid: DatumSource;
  nationaliteit: TyperingSource;
  redenOpname: TyperingSource;
};

type GeboorteSource = {
  land: TyperingSource;
  plaats: TyperingSource;
  datum: DatumSource;
};

type OverlijdenSource = {
  datum: DatumSource;
};

type InOnderzoek = Record<string, boolean>;

export type VerblijfplaatsSource = {
  type:
    | 'Adres'
    | 'Locatie'
    | 'VerblijfplaatsBuitenland'
    | 'VerblijfplaatsOnbekend';
  verblijfadres: VerblijfadresSource;
  functieAdres: TyperingSource;
  indicatieVastgesteldVerblijftNietOpAdres: boolean;
  adresseerbaarObjectIdentificatie: string;
  nummeraanduidingIdentificatie: string;
  datumVan: DatumSource;
  inOnderzoek: InOnderzoek;
};

export type VerblijfadresSource = {
  officieleStraatnaam: string;
  korteStraatnaam: string;
  huisnummer: number;
  huisnummertoevoeging: string;
  huisletter: string;
  postcode: string;
  woonplaats: string;
  inOnderzoek: InOnderzoek;
  land?: TyperingSource; // Is only a property of VerblijfAdresBuitenland.
  locatiebeschrijving?: string; // Is only a property of VerblijfadresLocatie.
};

type ImmigratieSource = {
  landVanwaarIngeschreven: TyperingSource;
};

type AdresseringSource = {
  aanhef: string;
  aanschrijfwijze: AanschrijfwijzeSource;
  gebruikInLopendeTekst: string;
  adresregel1: string;
  adresregel2: string;
  land?: TyperingSource;
};

type AanschrijfwijzeSource = {
  naam: string;
};

type JaarDatum = {
  type: 'JaarDatum';
  jaar: string;
  langFormaat: string;
};

type JaarMaandDatum = {
  type: 'JaarMaandDatum';
  jaar: string;
  maand: string;
  langFormaat: string;
};

type VolledigeDatum = {
  type: 'Datum';
  datum: string;
  langFormaat: string;
};

type DatumOnbekend = {
  type: 'DatumOnbekend';
  onbekend: true;
  langFormaat: string;
};

export type DatumSource =
  | JaarDatum
  | JaarMaandDatum
  | VolledigeDatum
  | DatumOnbekend;

export type PersoonBasisSource = {
  naam: NaamSource;
  overlijden: OverlijdenSource;
  geboorte: GeboorteSource;
};

type KindSource = PersoonBasisSource;
type OuderSource = PersoonBasisSource;

type PartnerSource = PersoonBasisSource & {
  aangaanHuwelijkPartnerschap: HuwelijkPartnerschapSource;
  ontbindingHuwelijkPartnerschap: HuwelijkPartnerschapSource;
  soortVerbintenis: TyperingSource;
};

type HuwelijkPartnerschapSource = {
  datum: DatumSource;
  land?: TyperingSource;
  plaats?: TyperingSource;
};

type PersoonSource = PersoonBasisSource & {
  aNummer: string;
  geheimhoudingPersoonsgegevens: boolean;
  burgerservicenummer: string;
  geslacht: TyperingSource;
  leeftijd: number;
  nationaliteiten: NationaliteitSource[];
  verblijfplaats: VerblijfplaatsSource;
  immigratie: ImmigratieSource;
  gemeenteVanInschrijving: TyperingSource;
  datumInschrijvingInGemeente: DatumSource;
  adressering: AdresseringSource;
  kinderen: KindSource[];
  ouders: OuderSource[];
  partners: PartnerSource[];
};

export type PersonenResponseSource = {
  type: string;
  personen: PersoonSource[];
};

export type VerblijfplaatshistorieResponseSource = {
  verblijfplaatsen: VerblijfplaatsSource[];
};

export type Adres = {
  straatnaam: string | null;
  postcode: string | null;
  woonplaatsNaam: string | null;
  landnaam: string | null;
  huisnummer: string | null;
  huisnummertoevoeging: string | null;
  huisletter: string | null;
  begindatumVerblijf: string | null;
  begindatumVerblijfFormatted?: string | null;
  locatiebeschrijving?: string | null;
  /** @deprecated Onderstaande gegevens worden niet meer gebruikt. */
  einddatumVerblijf?: string | null;
  /** @deprecated */
  mokum?: boolean;
  /** @deprecated */
  _adresSleutel?: string;
};

export type PersoonBasis = {
  geboortedatum: string | null;
  geboortedatumFormatted?: string | null;
  overlijdensdatum?: string | null;
  overlijdensdatumFormatted?: string | null;
  geboortelandnaam: string | null;
  geboorteplaatsnaam: string | null;
  geslachtsnaam: string | null;
  omschrijvingAdellijkeTitel: string | null;
  opgemaakteNaam: string | null;
  voornamen: string | null;
  voorvoegselGeslachtsnaam: string | null;
};

export type Persoon = PersoonBasis & {
  bsn: string | null;
  gemeentenaamInschrijving: string | null;
  omschrijvingBurgerlijkeStaat: 'Ongehuwd' | null;
  omschrijvingGeslachtsaanduiding: string | null;
  nationaliteiten: Array<{ omschrijving: string }>;
  mokum: boolean;
  vertrokkenOnbekendWaarheen: boolean;
  datumVertrekUitNederland: string | null;
  datumVertrekUitNederlandFormatted?: string | null;
  indicatieGeheim: boolean;
  adresInOnderzoek: '080000' | '089999' | null;

  /** @deprecated Deze gegevens worden niet meer gebruikt. */
  aanduidingNaamgebruikOmschrijving: string | null;
  indicatieGeboortedatum?: 'J' | 'M' | 'D' | 'V' | null;
};

export type Verbintenis = {
  datumOntbinding: string | null;
  datumOntbindingFormatted?: string | null;
  datumSluiting: string | null;
  datumSluitingFormatted?: string | null;
  persoon: PersoonBasis;

  /** @deprecated Deze gegevens worden in de BENK-BRP niet meer gebruikt. */
  plaatsnaamSluitingOmschrijving?: string | null;
  soortVerbintenis?: string | null;
  soortVerbintenisOmschrijving?: string | null;
};

export type Kind = PersoonBasis;
export type Ouder = PersoonBasis;

export type BrpFrontend = {
  persoon: Persoon;
  verbintenis: Verbintenis | null;
  kinderen: Kind[];
  ouders: Ouder[];
  adres: Adres | null;
  adresHistorisch: Adres[];
};
