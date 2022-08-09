import { Flyeren as FlyerenVergunning } from '../../../server/services';
import { defaultDateFormat } from '../../../universal/helpers';
import { InfoDetail } from '../../components';
import { InfoDetailGroup } from '../../components/InfoDetail/InfoDetail';
import { Location } from './Location';
import styles from './VergunningDetail.module.scss';

export function Flyeren({ vergunning }: { vergunning: FlyerenVergunning }) {
  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning?.identifier || '-'} />
      {!!vergunning.decision && <Location location={vergunning.location} />}
      {!!vergunning?.decision && (
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
      {!!vergunning?.decision && (
        <InfoDetail label="Resultaat" value={vergunning.decision} />
      )}
    </>
  );
}
