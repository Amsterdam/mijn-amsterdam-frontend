import type { BZP } from '../../../../../server/services/parkeren/config-and-types';
import { VergunningFrontend } from '../../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../../components/Datalist/Datalist';
import {
  getRows,
  dateRange,
  commonTransformers,
} from '../../Vergunningen/detail-page-content/fields-config';

export function BZP({ vergunning }: { vergunning: VergunningFrontend<BZP> }) {
  const dateRangeTransformer = () => {
    return vergunning.processed ? dateRange(vergunning) : null;
  };

  const rows = getRows(vergunning, [
    commonTransformers.identifier,
    commonTransformers.kentekens,
    dateRangeTransformer,
    commonTransformers.decision,
  ]);

  return <Datalist rows={rows} />;
}
