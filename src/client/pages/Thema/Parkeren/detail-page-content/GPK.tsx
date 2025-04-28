import type { GPK } from '../../../../../server/services/parkeren/config-and-types';
import { VergunningFrontend } from '../../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../../components/Datalist/Datalist';
import { getRows } from '../../Vergunningen/detail-page-content/fields-config';

export function GPK({ vergunning }: { vergunning: VergunningFrontend<GPK> }) {
  const cardNumber = () => ({
    label: 'Kaartnummer',
    content: vergunning.cardNumber,
  });

  const cardType = () => ({
    label: 'Soort kaart',
    content: vergunning.cardType,
  });

  const dateEnd = () => ({
    label: 'Vervaldatum',
    content: vergunning.dateEndFormatted,
  });

  const rows = getRows(vergunning, [
    'identifier',
    cardNumber,
    cardType,
    dateEnd,
    'decision',
  ]);

  return <Datalist rows={rows} />;
}
