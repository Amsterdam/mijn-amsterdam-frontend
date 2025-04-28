import { Link } from '@amsterdam/design-system-react';

import type { EigenParkeerplaats } from '../../../../../server/services/parkeren/config-and-types';
import type { VergunningFrontend } from '../../../../../server/services/vergunningen/config-and-types';
import { Datalist, type Row } from '../../../../components/Datalist/Datalist';
import { AddressDisplayAndModal } from '../../../../components/LocationModal/LocationModal';
import {
  dateRange,
  getRows,
} from '../../Vergunningen/detail-page-content/fields-config';

export function EigenParkeerplaats({
  vergunning,
}: {
  vergunning: VergunningFrontend<EigenParkeerplaats>;
}) {
  const requestTypes = () => {
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
  };

  const location = () => {
    const rows: Row[] = vergunning.locations
      ?.map((location, i) => {
        return [
          {
            label: 'Locatie',
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
      })
      .flat();
    return rows;
  };

  const vorigeKentekens = () => {
    return vergunning.requestTypes.some(
      (type) => type === 'Kentekenwijziging'
    ) && 'vorigeKentekens' in vergunning
      ? {
          label: 'Oud kenteken',
          content: vergunning.vorigeKentekens || '-',
        }
      : null;
  };

  const dateRangeTransformer = () => {
    return vergunning.processed && vergunning.dateStart && vergunning.dateEnd
      ? dateRange(vergunning)
      : null;
  };

  const rows = getRows(vergunning, [
    'identifier',
    requestTypes,
    location,
    'kentekens',
    vorigeKentekens,
    dateRangeTransformer,
    'decision',
  ]);

  return <Datalist rows={rows} />;
}
