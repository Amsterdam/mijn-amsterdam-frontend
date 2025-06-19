import type { Adres, Kind, Persoon, Verbintenis } from '../profile/brp.types';

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

type VerblijfplaatsSource = {
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

type VerblijfadresSource = {
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

type KindSource = {
  naam: NaamSource;
  geboorte: GeboorteSource;
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

type OuderSource = {
  naam: NaamSource;
  overlijden: OverlijdenSource;
  geboorte: GeboorteSource;
};

type PartnerSource = {
  naam: NaamSource;
  geboorte: GeboorteSource;
  aangaanHuwelijkPartnerschap: HuwelijkPartnerschapSource;
  ontbindingHuwelijkPartnerschap: HuwelijkPartnerschapSource;
  soortVerbintenis: TyperingSource;
};

type HuwelijkPartnerschapSource = {
  datum: DatumSource;
  land?: TyperingSource;
  plaats?: TyperingSource;
};

type PersoonSource = {
  aNummer: string;
  geheimhoudingPersoonsgegevens: boolean;
  burgerservicenummer: string;
  geslacht: TyperingSource;
  leeftijd: number;
  naam: NaamSource;
  nationaliteiten: NationaliteitSource[];
  geboorte: GeboorteSource;
  overlijden: OverlijdenSource;
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

type Ouder = Partial<Persoon>;

export type BrpFrontend = {
  persoon: Persoon;
  verbintenis: Verbintenis | null;
  kinderen: Kind[];
  ouders: Ouder[];
  adres: Adres;
};
