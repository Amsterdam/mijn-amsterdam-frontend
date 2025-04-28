import { Link } from '@amsterdam/design-system-react';

import type { EigenParkeerplaatsOpheffen } from '../../../../../server/services/parkeren/config-and-types';
import { VergunningFrontend } from '../../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../../components/Datalist/Datalist';
import styles from '../../../../components/LocationModal/LocationModal.module.scss';
import {
  getRows,
  kentekens,
} from '../../Vergunningen/detail-page-content/fields-config';

export function EigenParkeerplaatsOpheffen({
  vergunning,
}: {
  vergunning: VergunningFrontend<EigenParkeerplaatsOpheffen>;
}) {
  const requestType = () => {
    return {
      label: 'Verzoek',
      content: `Opheffing ${
        vergunning.isCarsharingpermit ? 'autodeelbedrijf' : ''
      }`,
    };
  };

  const locationType = () => {
    return vergunning.location.type
      ? {
          label: 'Soort plek',
          content: vergunning.location.type,
        }
      : null;
  };

  const locationUrl = () => {
    return vergunning.location.url
      ? {
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
        }
      : null;
  };

  const rows = getRows(vergunning, [
    'identifier',
    requestType,
    locationType,
    kentekens,
    locationUrl,
    'decision',
  ]);

  return <Datalist rows={rows} />;
}
