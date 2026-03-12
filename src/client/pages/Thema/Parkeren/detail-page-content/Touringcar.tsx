import type {
  TouringcarDagontheffing,
  TouringcarJaarontheffing,
} from '../../../../../server/services/parkeren/config-and-types.ts';
import type { DecosZaakFrontend } from '../../../../../server/services/vergunningen/config-and-types.ts';
import { Datalist } from '../../../../components/Datalist/Datalist.tsx';
import {
  commonTransformers,
  dateRange,
  dateTimeRange,
  getRows,
} from '../../Vergunningen/detail-page-content/fields-config.tsx';

export function Touringcar({
  vergunning,
}: {
  vergunning: DecosZaakFrontend<
    TouringcarDagontheffing | TouringcarJaarontheffing
  >;
}) {
  const dateRangeYear = () => {
    return vergunning.processed &&
      vergunning.isVerleend &&
      vergunning.caseType === 'Touringcar Jaarontheffing'
      ? dateRange(vergunning)
      : null;
  };

  const dateRangeDay = () => {
    return vergunning.processed &&
      vergunning.isVerleend &&
      vergunning.caseType === 'Touringcar Dagontheffing'
      ? dateTimeRange(vergunning)
      : null;
  };

  const rows = getRows(vergunning, [
    commonTransformers.identifier,
    commonTransformers.kentekens,
    {
      label: 'Bestemming',
      content: vergunning.destination,
    },
    dateRangeYear,
    dateRangeDay,
    commonTransformers.decision,
  ]);

  return <Datalist rows={rows} />;
}
