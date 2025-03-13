import { VarenVergunningFrontend } from '../../../server/services/varen/config-and-types';

export const CONTENT_EMPTY = '-';

export const isVergunning = (vergunning: VarenVergunningFrontend) =>
  vergunning.processed &&
  vergunning.decision === 'Verleend' &&
  (vergunning.caseType === 'Varen vergunning exploitatie' ||
    vergunning.caseType === 'Varen ligplaatsvergunning');
