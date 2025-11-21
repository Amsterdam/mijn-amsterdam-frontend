import { commonTransformers, getRows } from './fields-config';
import type {
  DecosZaakFrontend,
  RVVHeleStad,
} from '../../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../../components/Datalist/Datalist';

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
