import { commonTransformers, getRows } from './fields-config.tsx';
import type {
  ERVV,
  VergunningFrontend,
} from '../../../../../server/services/vergunningen/config-and-types.ts';
import { Datalist } from '../../../../components/Datalist/Datalist.tsx';

export function ERVV({ vergunning }: { vergunning: VergunningFrontend<ERVV> }) {
  const rows = getRows(vergunning, [
    commonTransformers.identifier,
    commonTransformers.description,
    commonTransformers.dateTimeRange,
    commonTransformers.decision,
  ]);
  return <Datalist rows={rows} />;
}
