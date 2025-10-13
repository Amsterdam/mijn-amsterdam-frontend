import { ZaakAanvraagDetail } from '../../../universal/types/App.types';
import { SmileSourceResponse, SmileFieldValue } from '../smile/smile-types';

export type AVGResponse = {
  aantal: number;
  verzoeken: AVGRequestFrontend[];
};

export interface AVGRequestFrontend extends ZaakAanvraagDetail {
  identifier: string;
  registratieDatum: string;
  type: string;
  toelichting: string;
  resultaat: string;
  ontvangstDatum: string;
  ontvangstDatumFormatted: string;
  opschortenGestartOp: string;
  datumInBehandeling: string;
  datumAfhandeling: string;
  themas: string;
}

export type SmileAvgResponse = SmileSourceResponse<SmileAVGRequest>;

export type SmileAVGRequest = {
  avgverzoek_id: SmileFieldValue;
  avgverzoek_statusavgverzoek_alias: SmileFieldValue;
  avgverzoek_datumbinnenkomst: SmileFieldValue;
  avgverzoek_typeverzoek: SmileFieldValue;
  avgverzoek_typeafhandelingvaststellen_resultaat: SmileFieldValue | null;
  avgverzoek_omschrijvingvanonderwerp: SmileFieldValue;
  avgverzoek_opschortengestartop: SmileFieldValue | null;
  avgverzoek_datuminbehandeling: SmileFieldValue | null;
  avgverzoek_werkelijkeeinddatum: SmileFieldValue | null;
};

export type SmileAvgThemesResponse = SmileSourceResponse<SmileAvgThemes>;

export type SmileAvgThemes = {
  themaperavgverzoek_avgthema_omschrijving: SmileFieldValue;
  themaperavgverzoek_avgverzoek_id: SmileFieldValue;
};

export type AvgTheme = {
  avgVerzoekId: string | null;
  themaOmschrijving: string | null;
};

export type AvgThemesResponse = {
  verzoeken: AvgTheme[];
};
