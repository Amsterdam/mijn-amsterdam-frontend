import type { BZP } from '../../../../server/services/parkeren/config-and-types';
import { VergunningFrontend } from '../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../components/Datalist/Datalist';
import {
  getRows,
  dateRange,
} from '../../Vergunningen/detail-page-content/fields-config';

export function BZP({ vergunning }: { vergunning: VergunningFrontend<BZP> }) {
  const rows = getRows(vergunning, [
    'identifier',
    'kentekens',
    {
      dateRange: (vergunning) => {
        return vergunning.processed ? dateRange(vergunning) : null;
      },
    },
    'decision',
  ]);

  return <Datalist rows={rows} />;
}
