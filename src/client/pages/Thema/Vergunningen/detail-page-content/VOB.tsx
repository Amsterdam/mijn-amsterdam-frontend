import { getRows } from './fields-config';
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
  const vesselKind = () => ({
    label: 'Soort vaartuig',
    content: vergunning.vesselKind || '-',
  });

  const vesselName = () => ({
    label: 'Naam vaartuig',
    content: vergunning.vesselName || '-',
  });

  const requestKind = () => ({
    label: 'Soort aanvraag',
    content: vergunning.requestKind || '-',
  });

  const reason = () => ({
    label: 'Reden',
    content: vergunning.reason || '-',
  });

  const rows = getRows(vergunning, [
    'identifier',
    'location',
    vesselKind,
    vesselName,
    requestKind,
    reason,
    'decision',
  ]);

  return <Datalist rows={rows} />;
}
