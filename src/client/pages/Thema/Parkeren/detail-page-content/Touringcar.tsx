import type {
  TouringcarDagontheffing,
  TouringcarJaarontheffing,
} from '../../../../../server/services/parkeren/config-and-types';
import { VergunningFrontend } from '../../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../../components/Datalist/Datalist';
import {
  commonTransformers,
  dateRange,
  dateTimeRange,
  getRows,
} from '../../Vergunningen/detail-page-content/fields-config';

export function Touringcar({
  vergunning,
}: {
  vergunning: VergunningFrontend<
    TouringcarDagontheffing | TouringcarJaarontheffing
  >;
}) {
  const isVerleend = vergunning.isVerleend;

  const dateRangeYear = () => {
    return vergunning.processed &&
      isVerleend &&
      vergunning.caseType === 'Touringcar Jaarontheffing'
      ? dateRange(vergunning)
      : null;
  };

  const dateRangeDay = () => {
    return vergunning.processed &&
      isVerleend &&
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
