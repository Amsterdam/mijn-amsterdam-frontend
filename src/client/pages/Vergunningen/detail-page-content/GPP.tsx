import { getRows } from './fields-config';
import {
  GPP,
  VergunningFrontend,
} from '../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../components/Datalist/Datalist';

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
