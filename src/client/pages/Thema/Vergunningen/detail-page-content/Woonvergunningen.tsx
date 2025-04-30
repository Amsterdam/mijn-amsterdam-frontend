import { commonTransformers, getRows } from './fields-config';
import type {
  VergunningFrontend,
  WoningVergunning,
} from '../../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../../components/Datalist/Datalist';

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
