import { commonTransformers, getRows } from './fields-config';
import type {
  EvenementVergunning,
  VergunningFrontend,
} from '../../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../../components/Datalist/Datalist';

export function EvenementVergunning({
  vergunning,
}: {
  vergunning: VergunningFrontend<EvenementVergunning>;
}) {
  const rows = getRows(vergunning, [
    commonTransformers.identifier,
    commonTransformers.description,
    commonTransformers.address,
    commonTransformers.dateTimeRange,
    commonTransformers.decision,
  ]);
  return <Datalist rows={rows} />;
}
