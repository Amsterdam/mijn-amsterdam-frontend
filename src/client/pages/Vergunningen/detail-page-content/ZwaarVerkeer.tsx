import { getRows } from './fields-config';
import type {
  VergunningFrontend,
  ZwaarVerkeer,
} from '../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../components/Datalist/Datalist';

export function ZwaarVerkeer({
  vergunning,
}: {
  vergunning: VergunningFrontend<ZwaarVerkeer>;
}) {
  const rows = getRows(vergunning, [
    'identifier',
    {
      exemptionKind: () => {
        return {
          label: 'Soort ontheffing',
          content: vergunning.exemptionKind || '-',
        };
      },
    },
    'kentekens',
    'dateRange',
    'decision',
  ]);

  return <Datalist rows={rows} />;
}
