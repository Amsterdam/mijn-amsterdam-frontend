import { getRows } from './fields-config';
import {
  GPP,
  VergunningFrontendV2,
} from '../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../components/Datalist/Datalist';

export function GPPContent({
  vergunning,
}: {
  vergunning: VergunningFrontendV2<GPP>;
}) {
  const rows = getRows(vergunning, [
    'identifier',
    'location',
    'kentekens',
    'decision',
  ]);

  return <Datalist rows={rows} />;
}
