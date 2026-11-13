import type {
  Omzettingsvergunning,
  ZaakFrontendCombined,
} from '../../../../../../../server/services/vergunningen/config-and-types.ts';
import { Datalist } from '../../../../../../components/Datalist/Datalist.tsx';
import { commonTransformers, getRows } from './fields-config.tsx';

export function Omzettingsvergunning({
  vergunning,
}: {
  vergunning: ZaakFrontendCombined<Omzettingsvergunning>;
}) {
  const rows = getRows(vergunning, [
    commonTransformers.identifier,
    commonTransformers.location,
    commonTransformers.decision,
  ]);
  return <Datalist rows={rows} />;
}
