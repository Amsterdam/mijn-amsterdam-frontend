import { ZaakAanvraagDetail } from '../../../universal/types/App.types';
import { SmileFieldValue, SmileSourceResponse } from '../smile/smile-types';

export type KlachtFrontend = {
  identifier: string;
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
  klacht_status: SmileFieldValue<SmileOpenStatus>;
  klacht_klachtstatus: SmileFieldValue<SmileDetailedStatus>;
  klacht_klachtopgelost: SmileFieldValue; // '' for unsolved or 'Ja' for solved.
  // Date of last update in 'dd-mm-yyyy hh:mm' format.
  klacht_updatedon: SmileFieldValue;
  // Date of finishing in 'dd-mm-yyyy hh:mm' format. Is empty before ever being closed.
  // Not sure if this date changes if we update again.
  klacht_afgehandeldrichtingklager: SmileFieldValue;
  // Date of completing the klacht in 'dd-mm-yyyy hh:mm' format.
  klacht_finishedon: SmileFieldValue;
  // Date of reopening the klacht after beind closed in 'dd-mm-yyyy hh:mm' format.
  klacht_reopenedon: SmileFieldValue;
};

type SmileOpenStatus = 'Open' | 'Gesloten';

// Archiveren maakt een SmileKlacht onzichtbaar bij het bevragen API.
type SmileDetailedStatus =
  | 'Toewijzen'
  // Bij neerzette verantwoordelijke afdeling -> 'Beoordelen/Accepteren'
  | 'Beoordelen/Accepteren'
  // Aangegeven geen klacht -> 'Heropend voor statusverzoek'
  // Alle taken afgerond -> 'Afgesloten' en 'Gesloten'
  | 'Heropend voor statusverzoek' // Na afsluiten en heropenen met reden statusverzoek
  | 'In behandeling'
  | 'Contact opnemen'
  | 'Coördinatie afhandeling'
  | 'Afgesloten';

export type SmileKlachtenReponse = SmileSourceResponse<SmileKlacht>;

export interface KlachtenResponse {
  aantal: number;
  klachten: KlachtFrontend[];
}
