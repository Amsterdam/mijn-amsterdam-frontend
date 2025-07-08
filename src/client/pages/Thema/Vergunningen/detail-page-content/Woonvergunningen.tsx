import { commonTransformers, getRows } from './fields-config.tsx';
import type {
  VergunningFrontend,
  WoningVergunning,
} from '../../../../../server/services/vergunningen/config-and-types.ts';
import { Datalist } from '../../../../components/Datalist/Datalist.tsx';

export function Woonvergunningen({
  vergunning,
}: {
  vergunning: VergunningFrontend<WoningVergunning>;
}) {
  const rows = getRows(vergunning, [
    commonTransformers.identifier,
    commonTransformers.location,
    commonTransformers.decision,
  ]);

  return <Datalist rows={rows} />;
}
