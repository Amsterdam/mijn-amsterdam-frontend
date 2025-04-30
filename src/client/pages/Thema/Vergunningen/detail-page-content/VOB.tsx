import { commonTransformers, getRows } from './fields-config';
import type {
  VergunningFrontend,
  Ligplaatsvergunning,
} from '../../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../../components/Datalist/Datalist';

export function VOB({
  vergunning,
}: {
  vergunning: VergunningFrontend<Ligplaatsvergunning>;
}) {
  const rows = getRows(vergunning, [
    commonTransformers.identifier,
    commonTransformers.location,
    {
      label: 'Soort vaartuig',
      content: vergunning.vesselKind || '-',
    },
    {
      label: 'Naam vaartuig',
      content: vergunning.vesselName || '-',
    },
    {
      label: 'Soort aanvraag',
      content: vergunning.requestKind || '-',
    },
    {
      label: 'Reden',
      content: vergunning.reason || '-',
    },
    commonTransformers.decision,
  ]);

  return <Datalist rows={rows} />;
}
