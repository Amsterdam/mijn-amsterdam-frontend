import type {
  DecosZaakFrontend,
  ZwaarVerkeer,
} from '../../../../../../../server/services/vergunningen/config-and-types.ts';
import { Datalist } from '../../../../../../components/Datalist/Datalist.tsx';
import { commonTransformers, getRows } from './fields-config.tsx';

export function ZwaarVerkeer({
  vergunning,
}: {
  vergunning: DecosZaakFrontend<ZwaarVerkeer>;
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
