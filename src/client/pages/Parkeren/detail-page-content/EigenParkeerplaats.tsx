import { Link } from '@amsterdam/design-system-react';

import type { EigenParkeerplaats } from '../../../../server/services/parkeren/config-and-types';
import type { VergunningFrontend } from '../../../../server/services/vergunningen/config-and-types';
import { Datalist, RowSet } from '../../../components/Datalist/Datalist';
import { AddressDisplayAndModal } from '../../../components/LocationModal/LocationModal';
import {
  dateRange,
  getRows,
} from '../../Vergunningen/detail-page-content/fields-config';

export function EigenParkeerplaats({
  vergunning,
}: {
  vergunning: VergunningFrontend<EigenParkeerplaats>;
}) {
  const rows = getRows(vergunning, [
    'identifier',
    {
      requestTypes: (vergunning: VergunningFrontend<EigenParkeerplaats>) => {
        return {
          label: 'Verzoek',
          content:
            vergunning.requestTypes.length > 1 ? (
              <ul>
                {vergunning.requestTypes.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            ) : (
              vergunning.requestTypes[0]
            ),
        };
      },
    },
    {
      locations: (vergunning: VergunningFrontend<EigenParkeerplaats>) => {
        const rows: RowSet[] = vergunning.locations?.map((location, i) => {
          return {
            // label: `Adres ${vergunning.locations?.length == 2 ? i + 1 : ''}`,
            rows: [
              {
                label: `Locatie`,
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
            ],
          };
        });
        return rows;
      },
    },
    'kentekens',
    {
      vorigeKentekens: (vergunning) => {
        return vergunning.requestTypes.some(
          (type) => type === 'Kentekenwijziging'
        ) && 'vorigeKentekens' in vergunning
          ? {
              label: 'Oud kenteken',
              content: vergunning.vorigeKentekens || '-',
            }
          : null;
      },
    },
    {
      dateRange: (vergunning) => {
        return vergunning.dateStart && vergunning.dateEnd
          ? dateRange(vergunning)
          : null;
      },
    },
    'decision',
  ]);

  return <Datalist rows={rows} />;
}
