import { Link } from '@amsterdam/design-system-react';
import type { EigenParkeerplaats as EigenParkeerplaatsType } from '../../../server/services';
import { defaultDateFormat } from '../../../universal/helpers';
import InfoDetail, {
  InfoDetailGroup,
} from '../../components/InfoDetail/InfoDetail';
import { Location } from './Location';
import styles from '../../components/LocationModal/LocationModal.module.scss';
import { default as styles2 } from './VergunningDetail.module.scss';
import { ReactNode } from 'react';

export function EigenParkeerplaats({
  vergunning,
}: {
  vergunning: EigenParkeerplaatsType;
}) {
  const isVerleend = vergunning.processed && vergunning.decision === 'Verleend';
  const isAfgehandeld = vergunning.processed;

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

      <InfoDetailGroup>
        {Array.isArray(vergunning.locations) &&
          vergunning.locations.map((location, i) => {
            return (
              <div className={i > 0 ? styles2.InfoGroupDivider : ''}>
                <Location
                  key={location.houseNumber}
                  label={`Adres ${vergunning.locations?.length == 2 ? i + 1 : ''}`}
                  location={`${location.street} ${location.houseNumber}`}
                />
                <InfoDetail
                  key={location.type}
                  label="Soort plek"
                  value={location.type}
                />
                <InfoDetail
                  key={location.url}
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
              </div>
            );
          })}
      </InfoDetailGroup>

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
