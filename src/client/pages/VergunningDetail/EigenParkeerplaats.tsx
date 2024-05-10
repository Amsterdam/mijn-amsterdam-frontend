import { Link } from '@amsterdam/design-system-react';
import type { EigenParkeerplaats as EigenParkeerplaatsType } from '../../../server/services';
import { defaultDateFormat } from '../../../universal/helpers';
import InfoDetail, {
  InfoDetailGroup,
} from '../../components/InfoDetail/InfoDetail';
import { Location } from './Location';
import styles from '../../components/LocationModal/LocationModal.module.scss';
import { JSX } from 'react/jsx-runtime';

export function EigenParkeerplaats({
  vergunning,
}: {
  vergunning: EigenParkeerplaatsType;
}) {
  const isVerleend = vergunning.processed && vergunning.decision === 'Verleend';
  const isAfgehandeld = vergunning.processed;

  let locationHTMLs: JSX.Element[] = [];

  if (Array.isArray(vergunning.locations)) {
    vergunning.locations.forEach((location, i) => {
      let name = 'Adres';
      // If two addresses: indicate the difference by adding 1 or 2.
      if (vergunning.locations!.length > 1) name = `Adres ${i + 1}`;
      locationHTMLs.push(
        <Location
          label={name}
          location={`${location.street} ${location.houseNumber}`}
        />,
        <InfoDetail label="Soort plek" value={location.type} />,
        <InfoDetail
          label="Parkeervak"
          value={
            <Link
              className={styles.LocationModalLink}
              variant="inline"
              href={location.url}
            >
              Bekijk parkeervak
            </Link>
          }
        />
      );
    });
  }

  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning.identifier || '-'} />
      <InfoDetail
        label="Verzoek"
        valueWrapperElement="div"
        value={
          <ul>
            {vergunning.requestTypes.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        }
      />

      {/* Bc above exactly 3 different InfoDetails are defined we can loop over
      them and put them together in a a row/InfoDetailGroup. */}
      {[0, 1, 2].map((i) => (
        <InfoDetailGroup key={i}>
          {locationHTMLs[i]}
          {locationHTMLs[i + 3]}
        </InfoDetailGroup>
      ))}

      <InfoDetail label="Kenteken(s)" value={vergunning.licensePlates} />
      {vergunning.requestTypes.some((type) => type === 'Kentekenwijziging') && (
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
