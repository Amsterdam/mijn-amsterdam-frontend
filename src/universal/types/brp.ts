import { LinkProps } from './App.types';

export interface IdentiteitsbewijsFromSource {
  id: string;
  documentNummer: string;
  documentType: 'europese identiteitskaart' | 'paspoort' | string;
  datumUitgifte: string;
  datumAfloop: string;
}

export interface Identiteitsbewijs extends IdentiteitsbewijsFromSource {
  title: string;
  link: LinkProps;
}

export interface Adres {
  straatnaam: string | null;
  postcode: string | null;
  woonplaatsNaam: string | null;
  huisnummer: string | null;
  huisnummertoevoeging: string | null;
  huisletter: string | null;
  begindatumVerblijf: string | null;
  inOnderzoek: boolean;
}

export interface Persoon {
  aanduidingNaamgebruikOmschrijving: string | null;
  bsn: string | null;
  geboortedatum: string | null;
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
  datumVertrekUitNederland: string;
  indicatieGeheim?: boolean;
}

export interface Verbintenis {
  datumOntbinding: string | null;
  datumSluiting: string;
  landnaamSluiting: string;
  plaatsnaamSluitingOmschrijving: string;
  soortVerbintenis: string;
  soortVerbintenisOmschrijving: string;
  persoon: Partial<Persoon>;
}

export interface VerbintenisHistorisch extends Verbintenis {
  redenOntbindingOmschrijving?: string | null;
}

export interface Kind {
  bsn: string | null;
  geboortedatum: string | null;
  geslachtsaanduiding: string | null;
  geslachtsnaam: string | null;
  overlijdensdatum: string | null;
  voornamen: string | null;
  voorvoegselGeslachtsnaam: string | null;
}

export interface BRPDataFromSource {
  persoon: Persoon;
  verbintenis?: Verbintenis;
  verbintenisHistorisch?: VerbintenisHistorisch[];
  kinderen?: Kind[];
  ouders: Partial<Persoon>[];
  adres: Adres;
  adresHistorisch?: Adres[];
  identiteitsbewijzen?: IdentiteitsbewijsFromSource[];
}

export interface BRPData extends BRPDataFromSource {
  identiteitsbewijzen?: Identiteitsbewijs[];
}
