import { commonTransformers, getRows } from './fields-config.tsx';
import type {
  VergunningFrontend,
  Omzettingsvergunning,
} from '../../../../../server/services/vergunningen/config-and-types.ts';
import { Datalist } from '../../../../components/Datalist/Datalist.tsx';

export function Omzettingsvergunning({
  vergunning,
}: {
  vergunning: VergunningFrontend<Omzettingsvergunning>;
}) {
  const rows = getRows(vergunning, [
    commonTransformers.identifier,
    commonTransformers.location,
    commonTransformers.decision,
  ]);
  return <Datalist rows={rows} />;
}
