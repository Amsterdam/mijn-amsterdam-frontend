import { Link } from '@amsterdam/design-system-react';

import type { EigenParkeerplaatsOpheffen } from '../../../../../server/services/parkeren/config-and-types';
import { VergunningFrontend } from '../../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../../components/Datalist/Datalist';
import { AddressDisplayAndModal } from '../../../../components/LocationModal/LocationModal';
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

  const location = () => {
    const location = vergunning.location;
    if (!location) {
      return null;
    }
    return [
      {
        label: 'Adres',
        content: (
          <AddressDisplayAndModal
            address={`${location.street} ${location.houseNumber}`}
          />
        ),
      },
      {
        label: 'Soort plek',
        content: location.type || null,
      },
      {
        label: 'Parkeervak',
        content: location.url ? (
          <Link rel="noreferrer" variant="inline" href={location.url}>
            Bekijk parkeervak
          </Link>
        ) : null,
      },
    ].filter((row) => row.content !== null);
  };

  const rows = getRows(vergunning, [
    'identifier',
    requestType,
    location,
    kentekens,
    'decision',
  ]);

  return <Datalist rows={rows} />;
}
