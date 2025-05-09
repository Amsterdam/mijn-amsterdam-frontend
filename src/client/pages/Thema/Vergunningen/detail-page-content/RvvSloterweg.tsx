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

  const area = () => {
    return {
      label: 'Zone',
      content: vergunning.area || '-',
    };
  };

  const kenteken = () => {
    return {
      label: isChangeRequest ? 'Nieuw kenteken' : 'Kenteken',
      content: vergunning.kentekens || '-',
    };
  };

  const vorigeKentekens = () => {
    return vergunning.vorigeKentekens
      ? {
          label: 'Kenteken(s)',
          content: vergunning.vorigeKentekens || '-',
        }
      : null;
  };

  const dateRange = () => {
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
  };

  const rows = getRows(vergunning, [
    commonTransformers.identifier,
    area,
    kenteken,
    vorigeKentekens,
    dateRange,
    commonTransformers.decision,
  ]);

  return <Datalist rows={rows} />;
}
