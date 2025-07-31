import type { GPP } from '../../../../../server/services/parkeren/config-and-types';
import { VergunningFrontend } from '../../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../../components/Datalist/Datalist';
import {
  commonTransformers,
  getRows,
} from '../../Vergunningen/detail-page-content/fields-config';

export function GPPContent({
  vergunning,
}: {
  vergunning: VergunningFrontend<GPP>;
}) {
  const rows = getRows(vergunning, [
    commonTransformers.identifier,
    commonTransformers.location,
    commonTransformers.kentekens,
    (vergunning) =>
      vergunning.kentekenNieuw
        ? {
            label: 'Nieuw kenteken',
            content: vergunning.kentekenNieuw,
          }
        : null,
    commonTransformers.decision,
  ]);

  return <Datalist rows={rows} />;
}
