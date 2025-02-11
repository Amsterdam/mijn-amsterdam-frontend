import { Link } from '@amsterdam/design-system-react';

import type { EigenParkeerplaatsOpheffen } from '../../../../server/services/parkeren/config-and-types';
import { VergunningFrontend } from '../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../components/Datalist/Datalist';
import styles from '../../../components/LocationModal/LocationModal.module.scss';
import { getRows } from '../../Vergunningen/detail-page-content/fields-config';

export function EigenParkeerplaatsOpheffen({
  vergunning,
}: {
  vergunning: VergunningFrontend<EigenParkeerplaatsOpheffen>;
}) {
  const rows = getRows(vergunning, [
    'identifier',
    {
      requestType: (vergunning) => {
        return {
          label: 'Verzoek',
          content: `Opheffing ${
            vergunning.isCarsharingpermit ? 'autodeelbedrijf' : ''
          }`,
        };
      },
    },
    {
      locationType: (vergunning) => {
        return {
          label: 'Soort plek',
          content: vergunning.location.type,
        };
      },
    },
    {
      locationUrl: (vergunning) => {
        return {
          label: 'Parkeervak',
          content: (
            <Link
              rel="noreferrer"
              className={styles.LocationModalLink}
              variant="inline"
              href={vergunning.location.url}
            >
              Bekijk parkeervak
            </Link>
          ),
        };
      },
    },
    'decision',
  ]);

  return <Datalist rows={rows} />;
}
