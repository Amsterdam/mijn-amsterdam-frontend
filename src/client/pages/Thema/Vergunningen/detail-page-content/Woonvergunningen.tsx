import { commonTransformers, getRows } from './fields-config.tsx';
import type {
  WoningVergunning,
  WoningVergunningDecos,
  ZaakFrontendCombined,
} from '../../../../../server/services/vergunningen/config-and-types.ts';
import { Datalist } from '../../../../components/Datalist/Datalist.tsx';

export function Woonvergunningen({
  vergunning,
}: {
  vergunning: ZaakFrontendCombined<WoningVergunning | WoningVergunningDecos>;
}) {
  const rows = getRows(vergunning, [
    commonTransformers.identifier,
    commonTransformers.location,
    commonTransformers.decision,
  ]);

  return <Datalist rows={rows} />;
}
