import type {
  DecosZaakFrontend,
  ERVV,
} from '../../../../../../../server/services/vergunningen/config-and-types.ts';
import { Datalist } from '../../../../../../components/Datalist/Datalist.tsx';
import { commonTransformers, getRows } from './fields-config.tsx';

export function ERVV({ vergunning }: { vergunning: DecosZaakFrontend<ERVV> }) {
  const rows = getRows(vergunning, [
    commonTransformers.identifier,
    commonTransformers.description,
    commonTransformers.dateTimeRange,
    commonTransformers.decision,
  ]);
  return <Datalist rows={rows} />;
}
