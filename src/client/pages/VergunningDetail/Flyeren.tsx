import { Flyeren as FlyerenVergunning } from '../../../server/services';
import { defaultDateFormat } from '../../../universal/helpers';
import { InfoDetail } from '../../components';
import { InfoDetailGroup } from '../../components/InfoDetail/InfoDetail';
import { Location } from './Location';
import styles from './VergunningDetail.module.scss';

// Controleren of van/tot dezelfde datum is, in dat geval niet de velden van/tot tonen.
// In dat geval allen de datum tonen.
export function Flyeren({ vergunning }: { vergunning: FlyerenVergunning }) {
  const isVerleend = vergunning.decision === 'Verleend';

  const isSameDate = vergunning.dateStart === vergunning.dateEnd;


  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning?.identifier || '-'} />
      {isVerleend && <Location location={vergunning.location} />}
      {isVerleend && !isSameDate && (

        <InfoDetailGroup className={styles.Flyeren_DateAndTime}>
          <InfoDetail
            label="Van"
            value={
              vergunning?.dateStart
                ? defaultDateFormat(vergunning.dateStart)
                : '-'
            }
          />
          <InfoDetail
            label="Tot en met"
            value={
              vergunning?.dateEnd ? defaultDateFormat(vergunning.dateEnd) : '-'
            }
          />
          <InfoDetail
            label="Tussen"
            value={`${vergunning?.timeStart} - ${vergunning?.timeEnd}`}
          />
        </InfoDetailGroup>
      )}
      {isVerleend && isSameDate && (

        <InfoDetailGroup className={styles.Flyeren_DateAndTime}>
          <InfoDetail
            label="Op"
            value={
              vergunning?.dateStart
                ? defaultDateFormat(vergunning.dateStart)
                : '-'
            }
          />
          <InfoDetail
            label="Van"
            value={vergunning?.timeStart ? `${vergunning.timeStart} uur` : '-'}
          />
          <InfoDetail
            label="Tot"
            value={vergunning?.timeEnd ? `${vergunning.timeEnd} uur` : '-'}
          />
        </InfoDetailGroup>
      )}
      {isVerleend && (
        <InfoDetail label="Resultaat" value={vergunning.decision} />
      )}
    </>
  );
}
