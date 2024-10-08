import { Link } from '@amsterdam/design-system-react';

import { Location } from './Location';
import { default as styles2 } from './VergunningDetail.module.scss';
import type { EigenParkeerplaats as EigenParkeerplaatsType } from '../../../server/services';
import { defaultDateFormat } from '../../../universal/helpers/date';
import InfoDetail, {
  InfoDetailGroup,
} from '../../components/InfoDetail/InfoDetail';
import styles from '../../components/LocationModal/LocationModal.module.scss';

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
          vergunning.requestTypes.length > 1 ? (
            <ul>
              {vergunning.requestTypes.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          ) : (
            vergunning.requestTypes[0]
          )
        }
      />

      <InfoDetailGroup>
        {vergunning.locations?.map((location, i) => {
          return (
            <div
              className={i > 0 ? styles2.InfoGroupDivider : ''}
              key={JSON.stringify(location)}
            >
              <Location
                label={`Adres ${vergunning.locations?.length == 2 ? i + 1 : ''}`}
                location={`${location.street} ${location.houseNumber}`}
              />
              {!!location.type && (
                <InfoDetail label="Soort plek" value={location.type} />
              )}
              {!!location.url && (
                <InfoDetail
                  label="Parkeervak"
                  value={
                    <Link
                      rel="noreferrer"
                      className={styles.LocationModalLink}
                      variant="inline"
                      href={location.url}
                    >
                      Bekijk parkeervak
                    </Link>
                  }
                />
              )}
            </div>
          );
        })}
      </InfoDetailGroup>

      <InfoDetail label="Kenteken(s)" value={vergunning.licensePlates} />
      {vergunning.requestTypes.some((type) => type === 'Kentekenwijziging') && (
        <InfoDetail
          label="Oud kenteken"
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
