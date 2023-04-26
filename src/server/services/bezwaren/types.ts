import { GenericDocument, LinkProps } from '../../../universal/types';

export type kenmerkKey =
  | 'statustekst'
  | 'statusdatum'
  | 'resultaattekst'
  | 'besluitnr'
  | 'besluitdatum'
  | 'datumintrekking';

export type Kenmerk = { kenmerk: kenmerkKey; bron: string };

export interface BezwaarSourceData {
  uuid: string;
  // Ontvangstdatum
  registratiedatum: string;
  // Bezwaarnummer
  identificatie: string;
  // Onderwerp
  omschrijving: string | null;
  // Specificatie
  toelichting: string | null;
  // Status tekst
  status: string | null;
  // Status datum ???
  // Datum intrekking ???
  // Primair besluit ??? kenmerken.resultaattekst?
  datumprimairbesluit: string | null;
  // Datum primair besluit ??? kenmerken.besluitdatum?
  // Documentnr/URL ???
  // Resultaat ????
  // Afhandeldatum ????
  startdatum: string;

  einddatum: string | null;

  kenmerken: Kenmerk[];
}

export type Bezwaar = {
  identificatie: string;
  uuid: string;
  ontvangstdatum: string;
  bezwaarnummer: string;
  omschrijving: string | null;
  toelichting: string | null;
  status: string | null;
  datumbesluit: string | null;
  datumIntrekking: string | null;
  einddatum: string | null;
  primairbesluit: string | null;
  primairbesluitdatum: string | null;
  resultaat: string | null;
  statussen: BezwaarStatus[];
  documenten: GenericDocument[];
  link: LinkProps;
};

export type BezwaarStatus = {
  uuid: string;
  datum: string;
  statustoelichting: string;
};

export type BezwaarSourceStatus = {
  url: string;
  uuid: string;
  zaak: string;
  statustype: string;
  datumStatusGezet: string;
  statustoelichting: string;
};

export interface BezwarenSourceResponse<T> {
  count: number;
  next: string;
  previous: string;
  results: T[];
}

export interface BezwaarDocument {
  titel: string;
  beschrijving: string;
  registratiedatum: string;
}

export interface BezwaarSourceDocument {
  url: string;
  uuid: string;
  informatieobject: string;
  zaak: string;
  aardRelatieWeergave: string;
  titel: string;
  beschrijving: string;
  registratiedatum: string;
}
