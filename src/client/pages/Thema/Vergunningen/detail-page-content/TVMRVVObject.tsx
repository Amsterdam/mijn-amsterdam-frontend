import { commonTransformers, getRows } from './fields-config';
import type {
  DecosZaakFrontend,
  TVMRVVObject,
} from '../../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../../components/Datalist/Datalist';

export function TVMRVVObject({
  vergunning,
}: {
  vergunning: DecosZaakFrontend<TVMRVVObject>;
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
