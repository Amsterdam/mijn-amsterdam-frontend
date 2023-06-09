import { LinkProps } from '../../../universal/types';
import { SmileSourceResponse, SmileFieldValue } from '../smile/smile-types';

export type AVGResponse = {
  aantal: number;
  verzoeken: AVGRequest[];
};

export type AVGRequest = {
  id: string;
  status: string;
  registratieDatum: string;
  type: string;
  onderwerp: string;
  toelichting: string;
  resultaat: string;
  ontvangstDatum: string;
  opschortenGestartOp: string;
  datumInBehandeling: string;
  datumAfhandeling: string;
  link: LinkProps;
};

export type SmileAvgResponse = SmileSourceResponse<SmileAVGRequest>;

export type SmileAVGRequest = {
  avgverzoek_id: SmileFieldValue;
  avgverzoek_statusavgverzoek_alias: SmileFieldValue;
  avgverzoek_datumbinnenkomst: SmileFieldValue;
  avgverzoek_typeverzoek: SmileFieldValue;
  avgverzoek_themas: SmileFieldValue;
  avgverzoek_typeafhandeling_resultaat: SmileFieldValue | null;
  avgverzoek_omschrijvingvanonderwerp: SmileFieldValue;
  avgverzoek_opschortengestartop: SmileFieldValue | null;
  avgverzoek_datuminbehandeling: SmileFieldValue | null;
  avgverzoek_werkelijkeeinddatum: SmileFieldValue | null;
};
