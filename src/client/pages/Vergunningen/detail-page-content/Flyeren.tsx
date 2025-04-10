import { commonTransformers, getRows } from './fields-config';
import type {
  Flyeren,
  VergunningFrontend,
} from '../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../components/Datalist/Datalist';

export function getRowsFlyeren(vergunning: VergunningFrontend) {
  const isVerleend = vergunning.decision === 'Verleend';
  const isSameDate =
    vergunning.dateStart === vergunning.dateEnd || vergunning.dateEnd === null;

  const rows = getRows(vergunning, [
    'identifier',
    'location',
    {
      onFromTo: (vergunning) => {
        return isVerleend && isSameDate
          ? commonTransformers.onFromTo(vergunning)
          : null;
      },
    },
    {
      dateTimeRangeBetween: (vergunning) => {
        return isVerleend && !isSameDate
          ? commonTransformers.dateTimeRangeBetween(vergunning)
          : null;
      },
    },
    'decision',
  ]);

  return rows;
}
// Controleren of van/tot dezelfde datum is, in dat geval niet de velden van/tot tonen.
// In dat geval allen de datum tonen.
export function Flyeren({
  vergunning,
}: {
  vergunning: VergunningFrontend<Flyeren>;
}) {
  return <Datalist rows={getRowsFlyeren(vergunning)} />;
}
