import type { GPK } from '../../../../server/services/parkeren/config-and-types';
import { VergunningFrontend } from '../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../components/Datalist/Datalist';
import { getRows } from '../../Vergunningen/detail-page-content/fields-config';

export function GPK({ vergunning }: { vergunning: VergunningFrontend<GPK> }) {
  const rows = getRows(vergunning, [
    'identifier',
    {
      cardNumber: () => ({
        label: 'Kaartnummer',
        content: vergunning.cardNumber,
      }),
    },
    {
      cardNumber: () => ({
        label: 'Soort kaart',
        content: vergunning.cardType,
      }),
    },
    {
      dateEnd: () => ({
        label: 'Vervaldatum',
        content: vergunning.dateEndFormatted,
      }),
    },
    'decision',
  ]);

  return <Datalist rows={rows} />;
}
