import { GenericDocument, LinkProps } from '../../../universal/types';

export type kenmerkKey =
  | 'statustekst'
  | 'statusdatum'
  | 'resultaattekst'
  | 'besluitnr'
  | 'besluitdatum'
  | 'datumintrekking'
  | 'zaakkenmerk';

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

  // Datum primair besluit
  datumprimairbesluit: string | null;

  // In behandeling
  startdatum: string;

  einddatum: string | null;

  kenmerken: Kenmerk[];
}

export type Bezwaar = {
  identificatie: string;
  zaakkenmerk: string;
  uuid: string;
  startdatum: string;
  ontvangstdatum: string;
  omschrijving: string | null;
  toelichting: string | null;
  status: string | null;
  statusdatum: string | null;
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

export interface BezwaarSourceDocument {
  url: string;
  identificatie: string;
  bronorganisatie: string | null;
  creatiedatum: string;
  titel: string;
  vertrouwelijkheidaanduiding: string;
  auteur: string;
  status: string;
  formaat: string;
  taal: string;
  versie: number;
  beginRegistratie: string;
  bestandsnaam: string;
  inhoud: string;
  bestandsomvang: string | null;
  link: string | null;
  beschrijving: string;
  ontvangstdatum: string;
  verzenddatum: string;
  indicatieGebruiksrecht: string | null;
  verschijningsvorm: string | null;
  ondertekening: string | null;
  integriteit: string | null;
  informatieobjecttype: string;
  locked: boolean;
  dossiertype:
    | 'Online Correspondentie'
    | 'Online Procesdossier'
    | 'Online Besluitvorming'
    | 'Online Aangeleverd';
}

export interface BezwaarDocument extends GenericDocument {
  dossiertype: BezwaarSourceDocument['dossiertype'];
}

export interface BezwaarResponse {
  bezwaren: Bezwaar[];
  count: number;
}
