import { VarenZakenFrontend } from '../../../../server/services/varen/config-and-types';

export const CONTENT_EMPTY = '-';

type VarenZaakVergunningFrontend = Pick<
  VarenZakenFrontend,
  'processed' | 'decision' | 'caseType'
>;
export const isVergunning = (vergunning: VarenZaakVergunningFrontend | null) =>
  !!vergunning &&
  vergunning.processed &&
  vergunning.decision === 'Verleend' &&
  vergunning.caseType === 'Varen vergunning exploitatie';
