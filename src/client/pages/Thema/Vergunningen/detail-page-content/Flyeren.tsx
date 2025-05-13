import { commonTransformers, getRows } from './fields-config';
import {
  DecosZaakBase,
  WithDateRange,
  WithDateTimeRange,
} from '../../../../../server/services/decos/decos-types';
import type {
  Flyeren,
  VergunningFrontend,
} from '../../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../../components/Datalist/Datalist';

const isSameDate = (vergunning: WithDateRange) =>
  vergunning.dateStart === vergunning.dateEnd || vergunning.dateEnd === null;

export function onFromToExceptSameDate(
  vergunning: VergunningFrontend<DecosZaakBase & WithDateTimeRange>
) {
  return vergunning.isVerleend && isSameDate(vergunning)
    ? commonTransformers.onFromTo(vergunning)
    : null;
}

export function dateTimeRangeBetweenIfSameDate(
  vergunning: VergunningFrontend<DecosZaakBase & WithDateTimeRange>
) {
  return vergunning.isVerleend && !isSameDate(vergunning)
    ? commonTransformers.dateTimeRangeBetween(vergunning)
    : null;
}

// Controleren of van/tot dezelfde datum is, in dat geval niet de velden van/tot tonen.
// In dat geval allen de datum tonen.
export function Flyeren({
  vergunning,
}: {
  vergunning: VergunningFrontend<Flyeren>;
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
