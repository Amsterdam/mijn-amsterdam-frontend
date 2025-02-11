import type {
  TouringcarDagontheffing,
  TouringcarJaarontheffing,
} from '../../../../server/services/parkeren/config-and-types';
import { VergunningFrontend } from '../../../../server/services/vergunningen/config-and-types';
import { CaseTypeV2 } from '../../../../universal/types/decos-zaken';
import { Datalist } from '../../../components/Datalist/Datalist';
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

  const rows = getRows(vergunning, [
    'identifier',
    'kentekens',
    {
      destination: () => ({
        label: 'Bestemming',
        content: vergunning.destination,
      }),
    },
    {
      dateRangeYear: () => {
        return vergunning.processed &&
          isGranted &&
          vergunning.caseType === CaseTypeV2.TouringcarJaarontheffing
          ? dateRange(vergunning)
          : null;
      },
    },
    {
      dateRangeDay: () => {
        return vergunning.processed &&
          isGranted &&
          vergunning.caseType === CaseTypeV2.TouringcarDagontheffing
          ? dateTimeRange(vergunning)
          : null;
      },
    },
    'decision',
  ]);

  return <Datalist rows={rows} />;
}
