import type {
  TouringcarDagontheffing,
  TouringcarJaarontheffing,
} from '../../../../../server/services/parkeren/config-and-types';
import { VergunningFrontend } from '../../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../../components/Datalist/Datalist';
import {
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
  const isGranted = vergunning.decision === 'Verleend';
  const destination = () => ({
    label: 'Bestemming',
    content: vergunning.destination,
  });

  const dateRangeYear = () => {
    return vergunning.processed &&
      isGranted &&
      vergunning.caseType === 'Touringcar Jaarontheffing'
      ? dateRange(vergunning)
      : null;
  };

  const dateRangeDay = () => {
    return vergunning.processed &&
      isGranted &&
      vergunning.caseType === 'Touringcar Dagontheffing'
      ? dateTimeRange(vergunning)
      : null;
  };

  const rows = getRows(vergunning, [
    'identifier',
    'kentekens',
    destination,
    dateRangeYear,
    dateRangeDay,
    'decision',
  ]);

  return <Datalist rows={rows} />;
}
