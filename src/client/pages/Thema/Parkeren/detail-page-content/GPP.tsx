import type { GPP } from '../../../../../server/services/parkeren/config-and-types';
import { VergunningFrontend } from '../../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../../components/Datalist/Datalist';
import { getRows } from '../../Vergunningen/detail-page-content/fields-config';

export function GPPContent({
  vergunning,
}: {
  vergunning: VergunningFrontend<GPP>;
}) {
  const rows = getRows(vergunning, [
    'identifier',
    'location',
    'kentekens',
    'decision',
  ]);

  return <Datalist rows={rows} />;
}
