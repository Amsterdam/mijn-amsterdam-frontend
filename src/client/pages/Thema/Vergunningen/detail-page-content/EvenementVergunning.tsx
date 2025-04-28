import { getRows } from './fields-config';
import type {
  EvenementVergunning,
  VergunningFrontend,
} from '../../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../../components/Datalist/Datalist';

export function EvenementVergunning({
  vergunning,
}: {
  vergunning: VergunningFrontend<EvenementVergunning>;
}) {
  const rows = getRows(vergunning, [
    'identifier',
    'description',
    'address',
    'dateTimeRange',
    'decision',
  ]);
  return <Datalist rows={rows} />;
}
