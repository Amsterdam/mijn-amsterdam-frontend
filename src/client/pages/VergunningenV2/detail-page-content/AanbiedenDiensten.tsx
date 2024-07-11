import {
  AanbiedenDiensten,
  VergunningFrontendV2,
} from '../../../../server/services/vergunningen-v2/config-and-types';
import { defaultDateFormat } from '../../../../universal/helpers/date';
import { InfoDetail } from '../../../components';
import { Datalist } from '../../../components/Datalist/Datalist';
import { InfoDetailGroup } from '../../../components/InfoDetail/InfoDetail';
import styles from './VergunningDetail.module.scss';
import { getRows } from './fields-config';

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
