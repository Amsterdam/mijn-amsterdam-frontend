import { Link } from '@amsterdam/design-system-react';

import type { EigenParkeerplaatsOpheffen } from '../../../../server/services/parkeren/config-and-types';
import InfoDetail from '../../../components/InfoDetail/InfoDetail';
import styles from '../../../components/LocationModal/LocationModal.module.scss';

export function EigenParkeerplaatsOpheffen({
  vergunning,
}: {
  vergunning: EigenParkeerplaatsOpheffen;
}) {
  const isAfgehandeld = vergunning.processed;
  const { street, type, url, houseNumber } = vergunning.location;

  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning.identifier || '-'} />
      <InfoDetail
        label="Verzoek"
        value={`Opheffing ${
          vergunning.isCarsharingpermit ? 'autodeelbedrijf' : ''
        }`}
      />

      {/* <Location label="Adres" location={`${street} ${houseNumber}`} /> */}

      {type && <InfoDetail label="Soort plek" value={type} />}

      {url && (
        <InfoDetail
          label="Parkeervak"
          value={
            <Link
              rel="noreferrer"
              className={styles.LocationModalLink}
              variant="inline"
              href={url}
            >
              Bekijk parkeervak
            </Link>
          }
        />
      )}

      {isAfgehandeld && (
        <InfoDetail label="Resultaat" value={vergunning.decision} />
      )}
    </>
  );
}
