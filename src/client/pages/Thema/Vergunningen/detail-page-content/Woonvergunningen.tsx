import { commonTransformers, getRows } from './fields-config';
import type {
  DecosZaakFrontend,
  WoningVergunning,
} from '../../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../../components/Datalist/Datalist';

export function Woonvergunningen({
  vergunning,
}: {
  vergunning: DecosZaakFrontend<WoningVergunning>;
}) {
  const rows = getRows(vergunning, [
    commonTransformers.identifier,
    commonTransformers.location,
    commonTransformers.decision,
  ]);

  return <Datalist rows={rows} />;
}
