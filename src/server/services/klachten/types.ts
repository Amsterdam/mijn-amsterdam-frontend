import { ZaakAanvraagDetail } from '../../../universal/types/App.types';
import { SmileFieldValue, SmileSourceResponse } from '../smile/smile-types';

export type KlachtFrontend = {
  inbehandelingSinds: string;
  ontvangstDatum: string;
  ontvangstDatumFormatted: string | null;
  omschrijving: string;
  gewensteOplossing: string | null;
  onderwerp: string | null;
  locatie: string | null;
} & ZaakAanvraagDetail;

export type SmileKlacht = {
  klacht_inbehandeling: SmileFieldValue;
  klacht_datumontvangstklacht: SmileFieldValue;
  klacht_omschrijving: SmileFieldValue;
  klacht_gewensteoplossing: SmileFieldValue;
  klacht_klachtonderwerp: SmileFieldValue;
  klacht_id: SmileFieldValue;
  klacht_locatieadres: SmileFieldValue;
};

export type SmileKlachtenReponse = SmileSourceResponse<SmileKlacht>;

export interface KlachtenResponse {
  aantal: number;
  klachten: KlachtFrontend[];
}
