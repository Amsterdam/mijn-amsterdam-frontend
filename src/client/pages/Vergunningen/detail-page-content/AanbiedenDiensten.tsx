import { getRows } from './fields-config';
import {
  AanbiedenDiensten,
  VergunningFrontendV2,
} from '../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../components/Datalist/Datalist';

export function AanbiedenDienstenContent({
  vergunning,
}: {
  vergunning: VergunningFrontendV2<AanbiedenDiensten>;
}) {
  const rows = getRows(vergunning, ['identifier', 'decision']);

  if (
    vergunning.decision === 'Verleend' &&
    (vergunning.dateEnd == null || vergunning.dateStart === vergunning.dateEnd)
  ) {
    rows.push({
      label: 'Op',
      content: vergunning.dateStartFormatted,
    });
  }

  if (
    vergunning.decision === 'Verleend' &&
    vergunning.dateEnd !== null &&
    vergunning.dateStart !== vergunning.dateEnd
  ) {
    rows.push({
      rows: [
        {
          label: 'Van',
          content: vergunning.dateStartFormatted,
        },
        {
          label: 'Tot',
          content: vergunning.dateEndFormatted,
        },
      ],
    });
  }

  return <Datalist rows={rows} />;
}
