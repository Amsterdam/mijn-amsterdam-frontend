import type { ReactNode } from 'react';

import { commonTransformers, getRows } from './fields-config';
import {
  AanbiedenDiensten,
  Straatartiesten,
  VergunningFrontend,
} from '../../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../../components/Datalist/Datalist';

export function AanbiedenDienstenEnStraatartiestenContent({
  vergunning,
}: {
  vergunning: VergunningFrontend<AanbiedenDiensten | Straatartiesten>;
}) {
  const waarvoor = () =>
    vergunning.caseType == 'Straatartiesten' && vergunning.category
      ? {
          label: 'Waarvoor',
          content: vergunning.category,
        }
      : null;

  const op = () =>
    vergunning.decision === 'Verleend' &&
    vergunning.dateStart &&
    (!vergunning.dateEnd || vergunning.dateStart === vergunning.dateEnd)
      ? {
          label: 'Op',
          content: vergunning.dateStartFormatted,
        }
      : null;

  const vanTot = () =>
    vergunning.decision === 'Verleend' &&
    vergunning.dateEnd !== null &&
    vergunning.dateStart !== vergunning.dateEnd
      ? {
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
        }
      : null;

  const location = () => {
    const location = commonTransformers.location(vergunning);
    let content: ReactNode = null;

    if (location && 'content' in location) {
      content = location.content;
    }

    return {
      content: content ?? '-',
      label: 'Locatie',
    };
  };

  const stadsdeel = () => {
    return {
      label: 'Stadsdeel',
      content: vergunning.stadsdeel,
    };
  };

  const rows = getRows(vergunning, [
    'identifier',
    waarvoor,
    stadsdeel,
    location,
    op,
    vanTot,
    'decision',
  ]);

  return <Datalist rows={rows} />;
}
