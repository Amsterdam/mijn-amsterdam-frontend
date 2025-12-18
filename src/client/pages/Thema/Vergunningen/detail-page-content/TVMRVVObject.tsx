import { commonTransformers, getRows } from './fields-config';
import type {
  TVMRVVObject,
  ZaakFrontendCombined,
} from '../../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../../components/Datalist/Datalist';

export function TVMRVVObject({
  vergunning,
}: {
  vergunning: ZaakFrontendCombined<TVMRVVObject>;
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
