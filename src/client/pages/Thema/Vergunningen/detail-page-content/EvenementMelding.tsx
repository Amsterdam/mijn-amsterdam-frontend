import { commonTransformers, getRows } from './fields-config';
import type {
  EvenementMelding,
  VergunningFrontend,
} from '../../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../../components/Datalist/Datalist';

export function EvenementMelding({
  vergunning,
}: {
  vergunning: VergunningFrontend<EvenementMelding>;
}) {
  const onFromTo = (vergunning: VergunningFrontend<EvenementMelding>) => {
    return vergunning.decision === 'Verleend'
      ? commonTransformers.onFromTo(vergunning)
      : null;
  };

  const rows = getRows(vergunning, [
    'identifier',
    'location',
    onFromTo,
    'decision',
  ]);

  return <Datalist rows={rows} />;
}
