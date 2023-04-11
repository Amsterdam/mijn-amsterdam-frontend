import { LinkProps } from '../../../universal/types';

export type kenmerkKey =
  | 'statustekst'
  | 'statusdatum'
  | 'resultaattekst'
  | 'besluitnr'
  | 'besluitdatum';

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
  uuid: string;
  ontvangstdatum: string;
  bezwaarnummer: string;
  omschrijving: string | null;
  toelichting: string | null;
  status: string | null;
  datumbesluit: string | null;
  einddatum: string | null;
  primairbesluit: string | null;
  primairbesluitdatum: string | null;
  resultaat: string | null;
  link: LinkProps;
};

export interface BezwarenSourceResponse<T> {
  count: number;
  next: string;
  previous: string;
  results: T[];
}

export interface BezwaarDocumentData {
  titel: string;
  beschrijving: string;
  registratiedatum: string;
  inhoud: string;
}
