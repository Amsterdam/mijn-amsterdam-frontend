import { Link } from '@amsterdam/design-system-react';
import type { EigenParkeerplaats as EigenParkeerplaatsType } from '../../../server/services';
import { defaultDateFormat } from '../../../universal/helpers';
import InfoDetail from '../../components/InfoDetail/InfoDetail';
import { Location } from './Location';
import styles from '../../components/LocationModal/LocationModal.module.scss';

export function EigenParkeerplaats({
  vergunning,
}: {
  vergunning: EigenParkeerplaatsType;
}) {
  const isVerleend = vergunning.processed && vergunning.decision === 'Verleend';
  const isAfgehandeld = vergunning.processed;
  let location1 = null;
  let location2 = null;

  if (Array.isArray(vergunning.locations)) {
    [location1, location2] = vergunning.locations;
  }

  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning.identifier || '-'} />
      <InfoDetail label="Verzoek" value={vergunning.requestType} />

      {!!location1 && (
        <>
          <Location
            label="Adres"
            location={`${location1.street} ${location1.houseNumber}`}
          />
          <InfoDetail label="Soort plek" value={location1.type} />
          <InfoDetail
            label="Parkeervak"
            value={
              <Link
                className={styles.LocationModalLink}
                variant="inline"
                href="location1.url"
              >
                Bekijk parkeervak
              </Link>
            }
          />
        </>
      )}

      {!!location2 && (
        <>
          <Location
            label="Adres"
            location={`${location2.street} ${location2.houseNumber}`}
          />
          <InfoDetail label="Soort plek" value={location2.type} />
          <InfoDetail
            label="Parkeervak"
            value={
              <Link
                className={styles.LocationModalLink}
                variant="inline"
                href="location2.url"
              >
                Bekijk parkeervak
              </Link>
            }
          />
        </>
      )}

      <InfoDetail label="Kenteken(s)" value={vergunning.licensePlates} />

      {vergunning.requestType === 'Kentekenwijziging' && (
        <InfoDetail
          label="Oude kenteken"
          value={vergunning.previousLicensePlates}
        />
      )}

      {isVerleend && vergunning.dateStart && (
        <InfoDetail
          label="Startdatum"
          value={defaultDateFormat(vergunning.dateStart)}
        />
      )}

      {isVerleend && vergunning.dateEnd && (
        <InfoDetail
          label="Vervaldatum"
          value={defaultDateFormat(vergunning.dateEnd)}
        />
      )}

      {isAfgehandeld && (
        <InfoDetail label="Resultaat" value={vergunning.decision} />
      )}
    </>
  );
}
