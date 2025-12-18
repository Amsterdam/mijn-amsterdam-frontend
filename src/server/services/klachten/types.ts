import { ZaakAanvraagDetail } from '../../../universal/types/App.types';
import { SmileFieldValue, SmileSourceResponse } from '../smile/smile-types';

export type KlachtFrontend = {
  identifier: string;
  inbehandelingSinds: string;
  ontvangstDatum: string;
  ontvangstDatumFormatted: string | null;
  dateClosed: string;
  dateClosedFormatted: string;
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
  klacht_status: SmileFieldValue<SmileOpenStatus>;
  klacht_klachtstatus: SmileFieldValue<SmileDetailedStatus>;
  klacht_klachtopgelost: SmileFieldValue; // '' for unsolved or 'Ja' for solved.
  // Date of last update in 'dd-mm-yyyy hh:mm' format.
  klacht_updatedon: SmileFieldValue;
  // Date of completing the klacht in 'dd-mm-yyyy hh:mm' format.
  klacht_finishedon: SmileFieldValue;
  // Date of reopening the klacht after beind closed in 'dd-mm-yyyy hh:mm' format.
  klacht_reopenedon: SmileFieldValue;
};

type SmileOpenStatus = 'Open' | 'Gesloten';

type SmileDetailedStatus =
  | 'Toewijzen'
  | 'Beoordelen/Accepteren'
  | 'Heropend voor statusverzoek'
  | 'In behandeling'
  | 'Contact opnemen'
  | 'Coördinatie afhandeling'
  | 'Afgesloten';

export type SmileKlachtenReponse = SmileSourceResponse<SmileKlacht>;

export interface KlachtenResponse {
  aantal: number;
  klachten: KlachtFrontend[];
}
