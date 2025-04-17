import { getRows } from './fields-config';
import type {
  VergunningFrontend,
  TVMRVVObject,
} from '../../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../../components/Datalist/Datalist';

export function TVMRVVObject({
  vergunning,
}: {
  vergunning: VergunningFrontend<TVMRVVObject>;
}) {
  const rows = getRows(vergunning, [
    'identifier',
    'description',
    'location',
    'dateTimeRange',
    'decision',
  ]);
  return <Datalist rows={rows} />;
}
