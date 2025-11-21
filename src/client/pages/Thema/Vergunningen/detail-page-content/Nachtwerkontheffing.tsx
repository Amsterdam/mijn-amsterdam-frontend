import { commonTransformers, getRows } from './fields-config';
import {
  onFromToExceptSameDate,
  dateTimeRangeBetweenIfSameDate,
} from './Flyeren';
import type {
  Nachtwerkontheffing,
  DecosZaakFrontend,
} from '../../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../../components/Datalist/Datalist';

// Controleren of van/tot dezelfde datum is, in dat geval niet de velden van/tot tonen.
// In dat geval allen de datum tonen.
export function Nachtwerkontheffing({
  vergunning,
}: {
  vergunning: DecosZaakFrontend<Nachtwerkontheffing>;
}) {
  const rows = getRows(vergunning, [
    commonTransformers.identifier,
    commonTransformers.location,
    onFromToExceptSameDate,
    dateTimeRangeBetweenIfSameDate,
    commonTransformers.decision,
  ]);
  return <Datalist rows={rows} />;
}
