import { commonTransformers, getRows } from './fields-config';
import type {
  VergunningFrontend,
  Omzettingsvergunning,
} from '../../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../../components/Datalist/Datalist';

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
