import { getRows } from './fields-config';
import type {
  VergunningFrontend,
  Ligplaatsvergunning,
} from '../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../components/Datalist/Datalist';

export function VOB({
  vergunning,
}: {
  vergunning: VergunningFrontend<Ligplaatsvergunning>;
}) {
  const rows = getRows(vergunning, [
    'identifier',
    'location',
    {
      vesselKind: (vergunning) => ({
        label: 'Soort vaartuig',
        content: vergunning.vesselKind || '-',
      }),
    },
    {
      vesselName: (vergunning) => ({
        label: 'Naam vaartuig',
        content: vergunning.vesselName || '-',
      }),
    },
    {
      requestKind: (vergunning) => ({
        label: 'Soort aanvraag',
        content: vergunning.requestKind || '-',
      }),
    },
    {
      reason: (vergunning) => ({
        label: 'Reden',
        content: vergunning.reason || '-',
      }),
    },
    'decision',
  ]);

  return <Datalist rows={rows} />;
}
