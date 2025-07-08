import type { GPK } from '../../../../../server/services/parkeren/config-and-types.ts';
import { VergunningFrontend } from '../../../../../server/services/vergunningen/config-and-types.ts';
import { Datalist } from '../../../../components/Datalist/Datalist.tsx';
import {
  commonTransformers,
  getRows,
} from '../../Vergunningen/detail-page-content/fields-config.tsx';

export function GPK({ vergunning }: { vergunning: VergunningFrontend<GPK> }) {
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
