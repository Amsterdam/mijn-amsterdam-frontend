import { commonTransformers, getRows } from './fields-config';
import type {
  ERVV,
  VergunningFrontend,
} from '../../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../../components/Datalist/Datalist';

export function ERVV({ vergunning }: { vergunning: VergunningFrontend<ERVV> }) {
  const rows = getRows(vergunning, [
    commonTransformers.identifier,
    commonTransformers.description,
    commonTransformers.dateTimeRange,
    commonTransformers.decision,
  ]);
  return <Datalist rows={rows} />;
}
