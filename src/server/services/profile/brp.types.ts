import { ZaakAanvraagDetail } from '../../../universal/types/App.types';

/** @deprecated */
export type IdentiteitsbewijsFromSource = {
  id: string;
  documentNummer: string;
  documentType: 'europese identiteitskaart' | 'paspoort';
  datumUitgifte: string;
  datumAfloop: string;
};

/** @deprecated */
export type IdentiteitsbewijsFrontend = ZaakAanvraagDetail &
  IdentiteitsbewijsFromSource & {
    datumUitgifteFormatted: string;
    datumAfloopFormatted: string;
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

export type Persoon = {
  bsn: string | null;
  geboortedatum: string | null;
  geboortedatumFormatted?: string | null;
  overlijdensdatum: string | null;
  overlijdensdatumFormatted?: string | null;
  geboortelandnaam: string | null;
  geboorteplaatsnaam: string | null;
  gemeentenaamInschrijving: string | null;
  voorvoegselGeslachtsnaam: string | null;
  geslachtsnaam: string | null;
  omschrijvingBurgerlijkeStaat: 'Ongehuwd' | null;
  omschrijvingGeslachtsaanduiding: string | null;
  omschrijvingAdellijkeTitel: string | null;
  opgemaakteNaam: string | null;
  voornamen: string | null;
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
  persoon: Partial<Persoon>; // TODO: Pick, voornamen, geslachtsnaam, voorvoegselGeslachtsnaam, opgemaakteNaam, geboortelandnaam, geboorteplaatsnaam
  /** @deprecated Deze gegevens worden in de BENK-BRP niet meer gebruikt. */
  plaatsnaamSluitingOmschrijving?: string | null;
  soortVerbintenis?: string | null;
  soortVerbintenisOmschrijving?: string | null;
};

export type VerbintenisHistorisch = Verbintenis & {
  redenOntbindingOmschrijving?: string | null;
};

export type Kind = {
  bsn?: string | null;
  geboortedatum: string | null;
  geboortedatumFormatted?: string | null;
  geslachtsaanduiding?: string | null;
  geslachtsnaam: string | null;
  overlijdensdatum?: string | null;
  voornamen: string | null;
  voorvoegselGeslachtsnaam: string | null;
};

export type BRPDataFromSource = {
  kvkNummer?: string;
  persoon: Persoon;
  verbintenis?: Verbintenis;
  kinderen?: Kind[];
  ouders: Partial<Persoon>[];
  adres: Adres;
  /** @deprecated Deze gegevens worden in de BENK-BRP niet meer voorzien. */
  verbintenisHistorisch?: VerbintenisHistorisch[];
  /** @deprecated */
  adresHistorisch?: Adres[];
  /** @deprecated */
  identiteitsbewijzen?: IdentiteitsbewijsFromSource[];
  /** @deprecated */
  fetchUrlAantalBewoners?: string;
};

export type BRPData = BRPDataFromSource & {
  identiteitsbewijzen?: IdentiteitsbewijsFrontend[];
};
