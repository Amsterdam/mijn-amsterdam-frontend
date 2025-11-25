import { commonTransformers, getRows } from './fields-config';
import type {
  WoningVergunning,
  ZaakFrontendCombined,
} from '../../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../../components/Datalist/Datalist';

export function Woonvergunningen({
  vergunning,
}: {
  vergunning: ZaakFrontendCombined<WoningVergunning>;
}) {
  const rows = getRows(vergunning, [
    commonTransformers.identifier,
    commonTransformers.location,
    commonTransformers.decision,
  ]);

  return <Datalist rows={rows} />;
}
