import { getRows } from './fields-config';
import type {
  VergunningFrontend,
  WoningVergunning,
} from '../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../components/Datalist/Datalist';

export function Woonvergunningen({
  vergunning,
}: {
  vergunning: VergunningFrontend<WoningVergunning>;
}) {
  const rows = getRows(vergunning, ['identifier', 'location', 'decision']);

  return <Datalist rows={rows} />;
}
