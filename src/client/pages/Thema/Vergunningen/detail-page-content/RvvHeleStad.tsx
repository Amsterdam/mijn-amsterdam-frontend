import { commonTransformers, getRows } from './fields-config.tsx';
import type {
  DecosZaakFrontend,
  RVVHeleStad,
} from '../../../../../server/services/vergunningen/config-and-types.ts';
import { Datalist } from '../../../../components/Datalist/Datalist.tsx';

export function RvvHeleStad({
  vergunning,
}: {
  vergunning: DecosZaakFrontend<RVVHeleStad>;
}) {
  const rows = getRows(vergunning, [
    commonTransformers.identifier,
    commonTransformers.kentekens,
    commonTransformers.dateRange,
    commonTransformers.decision,
  ]);
  return <Datalist rows={rows} />;
}
