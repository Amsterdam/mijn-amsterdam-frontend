import { getRows } from './fields-config';
import type {
  RVVSloterweg,
  VergunningFrontend,
} from '../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../components/Datalist/Datalist';

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
        return 'vorigeKentekens' in vergunning &&
          typeof vergunning.vorigeKentekens === 'string'
          ? {
              label: 'Kenteken(s)',
              content: vergunning.vorigeKentekens || '-',
            }
          : null;
      },
    },
    'dateRange',
    'decision',
  ]);

  return <Datalist rows={rows} />;
}
