import { commonTransformers, getRows } from './fields-config.tsx';
import type {
  VergunningFrontend,
  ZwaarVerkeer,
} from '../../../../../server/services/vergunningen/config-and-types.ts';
import { Datalist } from '../../../../components/Datalist/Datalist.tsx';

export function ZwaarVerkeer({
  vergunning,
}: {
  vergunning: VergunningFrontend<ZwaarVerkeer>;
}) {
  const exemptionKind = () =>
    vergunning.exemptionKind
      ? {
          label: 'Soort ontheffing',
          content: vergunning.exemptionKind,
        }
      : null;

  const rows = getRows(vergunning, [
    commonTransformers.identifier,
    exemptionKind,
    commonTransformers.kentekens,
    commonTransformers.dateRange,
    commonTransformers.decision,
  ]);

  return <Datalist rows={rows} />;
}
