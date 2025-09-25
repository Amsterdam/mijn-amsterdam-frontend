import { commonTransformers, getRows } from './fields-config';
import type {
  EvenementMelding,
  DecosZaakFrontend,
} from '../../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../../components/Datalist/Datalist';

export function EvenementMelding({
  vergunning,
}: {
  vergunning: DecosZaakFrontend<EvenementMelding>;
}) {
  const onFromTo = (vergunning: DecosZaakFrontend<EvenementMelding>) => {
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
