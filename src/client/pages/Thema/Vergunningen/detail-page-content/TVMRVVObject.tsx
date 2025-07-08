import { commonTransformers, getRows } from './fields-config.tsx';
import type {
  VergunningFrontend,
  TVMRVVObject,
} from '../../../../../server/services/vergunningen/config-and-types.ts';
import { Datalist } from '../../../../components/Datalist/Datalist.tsx';

export function TVMRVVObject({
  vergunning,
}: {
  vergunning: VergunningFrontend<TVMRVVObject>;
}) {
  const rows = getRows(vergunning, [
    commonTransformers.identifier,
    commonTransformers.description,
    commonTransformers.location,
    commonTransformers.dateTimeRange,
    commonTransformers.decision,
  ]);
  return <Datalist rows={rows} />;
}
