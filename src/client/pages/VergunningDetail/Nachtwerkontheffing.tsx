import type { Nachtwerkontheffing as NachtwerkontheffingType } from '../../../server/services';
import {
  dateTimeFormatYear,
  defaultDateFormat,
} from '../../../universal/helpers';
import InfoDetail, {
  InfoDetailGroup,
} from '../../components/InfoDetail/InfoDetail';
import { Location } from './Location';
import styles from './VergunningDetail.module.scss';

export function Nachtwerkontheffing({
  vergunning,
}: {
  vergunning: NachtwerkontheffingType;
}) {
  const isVerleend = vergunning.decision === 'Verleend';
  const isAfgehandeld = vergunning.status === 'Afgehandeld';
  const isSameDate =
    vergunning.dateStart === vergunning.dateEnd || vergunning.dateEnd === null;

  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning.identifier || '-'} />
      {isVerleend && <Location location={vergunning.location} />}

      {isVerleend && !isSameDate && (
        <InfoDetailGroup className={styles.DateAndTime_SingleLine}>
          <InfoDetail
            label="Vanaf"
            value={
              vergunning.dateStart
                ? defaultDateFormat(vergunning.dateStart)
                : '-'
            }
          />
          <InfoDetail
            label="Tot en met"
            value={
              vergunning.dateEnd ? defaultDateFormat(vergunning.dateEnd) : '-'
            }
          />
          <InfoDetail
            label="Tussen"
            value={`${vergunning.timeStart} - ${vergunning.timeEnd}`}
          />
        </InfoDetailGroup>
      )}
      {isVerleend && isSameDate && (
        <InfoDetailGroup className={styles.DateAndTime_SingleLine}>
          <InfoDetail
            label="Op"
            value={
              vergunning.dateStart
                ? defaultDateFormat(vergunning.dateStart)
                : '-'
            }
          />
          <InfoDetail
            label="Van"
            value={vergunning.timeStart ? `${vergunning.timeStart} uur` : '-'}
          />
          <InfoDetail
            label="Tot"
            value={vergunning.timeEnd ? `${vergunning.timeEnd} uur` : '-'}
          />
        </InfoDetailGroup>
      )}
      {isAfgehandeld && (
        <InfoDetail label="Resultaat" value={vergunning.decision} />
      )}
    </>
  );
}
