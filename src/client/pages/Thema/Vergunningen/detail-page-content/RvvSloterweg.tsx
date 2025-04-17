import { commonTransformers, getRows } from './fields-config';
import type {
  RVVSloterweg,
  VergunningFrontend,
} from '../../../../../server/services/vergunningen/config-and-types';
import {
  Datalist,
  RowSet,
  WrappedRow,
} from '../../../../components/Datalist/Datalist';

export function RvvSloterweg({
  vergunning,
}: {
  vergunning: VergunningFrontend<RVVSloterweg>;
}) {
  const isChangeRequest = vergunning.requestType === 'Wijziging';

  const rows = getRows(vergunning, [
    'identifier',
    {
      area: (vergunning) => {
        return {
          label: 'Zone',
          content: vergunning.area || '-',
        };
      },
    },
    {
      kenteken: (vergunning) => {
        return {
          label: isChangeRequest ? 'Nieuw kenteken' : 'Kenteken',
          content: vergunning.kentekens || '-',
        };
      },
    },
    {
      vorigeKentekens: (vergunning) => {
        return vergunning.vorigeKentekens
          ? {
              label: 'Kenteken(s)',
              content: vergunning.vorigeKentekens || '-',
            }
          : null;
      },
    },
    {
      dateRange: (vergunning) => {
        const from = commonTransformers.dateStart(vergunning) as WrappedRow;
        const to = commonTransformers.dateEnd(vergunning, {
          endDateIncluded: true,
        }) as WrappedRow;

        const rowSet: RowSet = {
          rows: [
            { ...from, span: 4 },
            vergunning.decision === 'Verleend' ? { ...to, span: 4 } : null,
          ].filter((row) => row !== null) as WrappedRow[],
        };

        return rowSet;
      },
    },
    'decision',
  ]);

  return <Datalist rows={rows} />;
}
