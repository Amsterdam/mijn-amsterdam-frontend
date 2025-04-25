import { getRows } from './fields-config';
import type {
  ERVV,
  VergunningFrontend,
} from '../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../components/Datalist/Datalist';

export function ERVV({ vergunning }: { vergunning: VergunningFrontend<ERVV> }) {
  const rows = getRows(vergunning, [
    'identifier',
    'description',
    'dateTimeRange',
    'decision',
  ]);
  return <Datalist rows={rows} />;
}
