import type { GPK } from '../../../../../server/services/parkeren/config-and-types';
import { DecosZaakFrontend } from '../../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../../components/Datalist/Datalist';
import {
  commonTransformers,
  getRows,
} from '../../Vergunningen/detail-page-content/fields-config';

export function GPK({ vergunning }: { vergunning: DecosZaakFrontend<GPK> }) {
  const rows = getRows(vergunning, [
    commonTransformers.identifier,
    {
      label: 'Kaartnummer',
      content: vergunning.cardNumber,
    },
    {
      label: 'Soort kaart',
      content: vergunning.cardType,
    },
    {
      label: 'Vervaldatum',
      content: vergunning.dateEndFormatted,
    },
    commonTransformers.decision,
  ]);

  return <Datalist rows={rows} />;
}
