export interface PersonenResponseSource {
  type: string;
  personen: PersoonSource[];
}

export interface TyperingSource {
  code: string;
  omschrijving: string;
}

export interface PersoonSource {
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
  kinderen: KinderenSource[];
  ouders: OuderSource[];
  partners: PartnerSource[];
}

export interface NaamSource {
  aanduidingNaamgebruik: TyperingSource;
  adellijkeTitelPredicaat: TyperingSource & { soort: 'predicaat' | 'titel' };
  voornamen: string;
  voorvoegsel: string;
  geslachtsnaam: string;
  voorletters: string;
  volledigeNaam: string;
}

export interface NationaliteitSource {
  type: string;
  datumIngangGeldigheid: DatumSource;
  nationaliteit: TyperingSource;
  redenOpname: TyperingSource;
}

export interface DatumIngangGeldigheidSource {
  type: string;
  datum: string;
  langFormaat: string;
}

export interface GeboorteSource {
  land: TyperingSource;
  plaats: TyperingSource;
  datum: DatumSource;
}

export interface OverlijdenSource {
  datum: DatumSource;
}

export interface DatumSource {
  type: string;
  datum: string;
  langFormaat: string;
}

type InOnderzoek = Record<string, boolean>;

export interface VerblijfplaatsSource {
  type: string;
  verblijfadres: VerblijfadresSource;
  functieAdres: TyperingSource;
  indicatieVastgesteldVerblijftNietOpAdres: boolean;
  adresseerbaarObjectIdentificatie: string;
  nummeraanduidingIdentificatie: string;
  datumVan: DatumSource;
  inOnderzoek: InOnderzoek;
}

export interface VerblijfadresSource {
  officieleStraatnaam: string;
  korteStraatnaam: string;
  huisnummer: number;
  huisnummertoevoeging: string;
  huisletter: string;
  postcode: string;
  woonplaats: string;
  inOnderzoek: InOnderzoek;
  land?: TyperingSource; // Is only a property of VerblijfAdresBuitenland.
}

export interface ImmigratieSource {
  landVanwaarIngeschreven: TyperingSource;
}

export interface DatumInschrijvingInGemeenteSource {
  type: string;
  datum: string;
  langFormaat: string;
}

export interface AdresseringSource {
  aanhef: string;
  aanschrijfwijze: AanschrijfwijzeSource;
  gebruikInLopendeTekst: string;
  adresregel1: string;
  adresregel2: string;
  land?: TyperingSource;
}

export interface AanschrijfwijzeSource {
  naam: string;
}

export interface KinderenSource {
  naam: NaamSource;
  geboorte: GeboorteSource;
}

export interface Naam2Source {
  voornamen: string;
  voorvoegsel: string;
  geslachtsnaam: string;
  voorletters: string;
}

export interface DatumSource {
  type: string;
  datum: string;
  langFormaat: string;
}

export interface OuderSource {
  naam: NaamSource;
  overlijden: OverlijdenSource;
  geboorte: GeboorteSource;
}

export interface NaamSource {
  voornamen: string;
  geslachtsnaam: string;
  voorletters: string;
}

export interface PartnerSource {
  naam: NaamSource;
  geboorte: DatumSource;
  aangaanHuwelijkPartnerschap: AangaanHuwelijkPartnerschapSource;
}

export interface AangaanHuwelijkPartnerschapSource {
  datum: DatumSource;
}

export type Adres = {
  straatnaam: string | null;
  postcode: string | null;
  woonplaatsNaam: string | null;
  landnaam: string | null;
  huisnummer: number | null;
  huisnummertoevoeging: string | null;
  huisletter: string | null;
  begindatumVerblijf: string | null;
  adresType: 'correspondentie' | 'woon';
  // wozWaarde?: ReactNode | null; / TODO: add to fe type
  mokum?: boolean;
};

export type Persoon = {
  aanduidingNaamgebruikOmschrijving: string | null;
  bsn: string | null;
  geboortedatum: string | null;
  indicatieGeboortedatum: 'J' | 'M' | 'D' | 'V' | null;
  overlijdensdatum: string | null;
  geboortelandnaam: string | null;
  geboorteplaatsnaam: string | null;
  gemeentenaamInschrijving: string | null;
  voorvoegselGeslachtsnaam: string | null;
  geslachtsnaam: string | null;
  omschrijvingBurgerlijkeStaat: string | null;
  omschrijvingGeslachtsaanduiding: string | null;
  omschrijvingAdellijkeTitel: string | null;
  opgemaakteNaam: string | null;
  voornamen: string | null;
  nationaliteiten: Array<{ omschrijving: string }>;
  mokum: boolean;
  vertrokkenOnbekendWaarheen: boolean;
  datumVertrekUitNederland: string | null;
  indicatieGeheim: boolean;
  adresInOnderzoek: '080000' | '089999' | null;
};

export type Verbintenis = {
  datumOntbinding: string | null;
  datumSluiting: string;
  landnaamSluiting: string;
  plaatsnaamSluitingOmschrijving: string;
  soortVerbintenis: string;
  soortVerbintenisOmschrijving: string;
  persoon: Partial<Persoon>;
};

export type VerbintenisHistorisch = Verbintenis & {
  redenOntbindingOmschrijving?: string | null;
};

export type Kind = {
  geboortedatum: string | null;
  volledigeNaam: string | null;
};

export type Ouder = {
  geboortedatum: string | null;
  overlijdensdatum?: string | null;
  volledigeNaam: string | null;
};

export type BrpFrontend = {
  persoon: Persoon;
  verbintenis?: Verbintenis;
  verbintenisHistorisch?: VerbintenisHistorisch[];
  kinderen?: Kind[];
  ouders?: Ouder[];
  adres: Adres;
};
