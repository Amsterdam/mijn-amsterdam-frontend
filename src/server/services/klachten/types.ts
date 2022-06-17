import { LinkProps } from '../../../universal/types';

export type Klacht = {
  inbehandelingSinds: string;
  ontvangstDatum: string;
  omschrijving: string;
  gewensteOplossing: string | null;
  onderwerp: string | null;
  id: string;
  locatie: string | null;
  link: LinkProps;
};

export type SmileFieldValue = {
  value: string | null;
};

export type SmileKlacht = {
  klacht_inbehandeling: SmileFieldValue;
  klacht_datumontvangstklacht: SmileFieldValue;
  klacht_omschrijving: SmileFieldValue;
  klacht_gewensteoplossing: SmileFieldValue;
  klacht_klachtonderwerp: SmileFieldValue;
  klacht_id: SmileFieldValue;
  klacht_locatieadres: SmileFieldValue;
};

export interface SmileSourceResponse {
  List: SmileKlacht[];
}
