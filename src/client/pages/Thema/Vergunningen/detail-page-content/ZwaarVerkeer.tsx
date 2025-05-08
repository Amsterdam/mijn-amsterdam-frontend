import { commonTransformers, getRows } from './fields-config';
import type {
  VergunningFrontend,
  ZwaarVerkeer,
} from '../../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../../components/Datalist/Datalist';

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
