import type {
  DecosZaakFrontend,
  EvenementVergunning,
} from '../../../../../../../server/services/vergunningen/config-and-types.ts';
import { Datalist } from '../../../../../../components/Datalist/Datalist.tsx';
import { commonTransformers, getRows } from './fields-config.tsx';

export function EvenementVergunning({
  vergunning,
}: {
  vergunning: DecosZaakFrontend<EvenementVergunning>;
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
