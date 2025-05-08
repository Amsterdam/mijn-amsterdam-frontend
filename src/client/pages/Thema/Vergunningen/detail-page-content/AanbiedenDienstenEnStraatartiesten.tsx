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
    vergunning.isVerleend &&
    vergunning.dateStartFormatted &&
    (!vergunning.dateEndFormatted ||
      vergunning.dateStartFormatted === vergunning.dateEndFormatted)
      ? {
          label: 'Op',
          content: vergunning.dateStartFormatted,
        }
      : null;

  const vanTot = () =>
    vergunning.isVerleend &&
    vergunning.dateEndFormatted &&
    vergunning.dateStartFormatted &&
    vergunning.dateStartFormatted !== vergunning.dateEndFormatted
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

    return content
      ? {
          content,
          label: 'Locatie',
        }
      : null;
  };

  const stadsdeel = () =>
    vergunning.stadsdeel
      ? {
          label: 'Stadsdeel',
          content: vergunning.stadsdeel,
        }
      : null;

  const rows = getRows(vergunning, [
    commonTransformers.identifier,
    waarvoor,
    stadsdeel,
    location,
    op,
    vanTot,
    commonTransformers.decision,
  ]);

  return <Datalist rows={rows} />;
}
