import { commonTransformers, getRows } from './fields-config';
import type {
  RVVSloterweg,
  DecosZaakFrontend,
} from '../../../../../server/services/vergunningen/config-and-types';
import {
  Datalist,
  RowSet,
  WrappedRow,
} from '../../../../components/Datalist/Datalist';

export function RvvSloterweg({
  vergunning,
}: {
  vergunning: DecosZaakFrontend<RVVSloterweg>;
}) {
  const isChangeRequest = vergunning.requestType === 'Wijziging';

  const area = () => {
    return vergunning.area
      ? {
          label: 'Zone',
          content: vergunning.area,
        }
      : null;
  };

  const kenteken = () => {
    return vergunning.kentekens
      ? {
          label: isChangeRequest ? 'Nieuw kenteken' : 'Kenteken',
          content: vergunning.kentekens,
        }
      : null;
  };

  const vorigeKentekens = () => {
    return vergunning.vorigeKentekens
      ? {
          label: 'Oud kenteken',
          content: vergunning.vorigeKentekens,
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
        { ...to, span: 4 },
      ].filter((row) => row !== null) as WrappedRow[],
    };

    return rowSet;
  };

  const rows = getRows(vergunning, [
    commonTransformers.identifier,
    area,
    kenteken,
    vorigeKentekens,
    () => (vergunning.decision !== 'Vervallen' ? dateRange() : null),
    commonTransformers.decision,
  ]);

  return <Datalist rows={rows} />;
}
