import { commonTransformers, getRows } from './fields-config';
import type {
  EvenementVergunning,
  DecosZaakFrontend,
} from '../../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../../components/Datalist/Datalist';

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
