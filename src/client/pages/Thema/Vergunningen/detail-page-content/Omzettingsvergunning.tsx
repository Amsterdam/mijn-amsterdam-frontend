import { commonTransformers, getRows } from './fields-config';
import type { PowerBrowserZaakFrontend } from '../../../../../server/services/powerbrowser/powerbrowser-types';
import type { Omzettingsvergunning } from '../../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../../components/Datalist/Datalist';

export function Omzettingsvergunning({
  vergunning,
}: {
  vergunning: PowerBrowserZaakFrontend<Omzettingsvergunning>;
}) {
  const rows = getRows(vergunning, [
    commonTransformers.identifier,
    commonTransformers.location,
    commonTransformers.decision,
  ]);
  return <Datalist rows={rows} />;
}
