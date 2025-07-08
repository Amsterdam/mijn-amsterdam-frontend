import { commonTransformers, getRows } from './fields-config.tsx';
import type {
  EvenementMelding,
  VergunningFrontend,
} from '../../../../../server/services/vergunningen/config-and-types.ts';
import { Datalist } from '../../../../components/Datalist/Datalist.tsx';

export function EvenementMelding({
  vergunning,
}: {
  vergunning: VergunningFrontend<EvenementMelding>;
}) {
  const onFromTo = (vergunning: VergunningFrontend<EvenementMelding>) => {
    return vergunning.processed
      ? commonTransformers.onFromTo(vergunning)
      : null;
  };

  const rows = getRows(vergunning, [
    commonTransformers.identifier,
    commonTransformers.location,
    onFromTo,
    commonTransformers.decision,
  ]);

  return <Datalist rows={rows} />;
}
