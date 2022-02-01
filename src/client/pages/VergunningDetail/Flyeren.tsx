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
      <InfoDetail label="Soort vergunning" value={vergunning.caseType || '-'} />
      {!!vergunning.location && <Location location={vergunning.location} />}
      <InfoDetailGroup className={styles.Flyeren_DateAndTime}>
        <InfoDetail label="&nbsp;" value="Op de dagen van" />
        <InfoDetail
          label="Van"
          value={
            vergunning?.dateStart
              ? defaultDateFormat(vergunning.dateStart)
              : '-'
          }
        />
        <InfoDetail
          label="Tot"
          value={
            vergunning?.dateEnd ? defaultDateFormat(vergunning.dateEnd) : '-'
          }
        />
      </InfoDetailGroup>
      <InfoDetailGroup className={styles.Flyeren_DateAndTime}>
        <InfoDetail label="&nbsp;" value="Tussen de tijdstippen" />
        <InfoDetail
          label="Van"
          value={vergunning?.timeStart ? vergunning?.timeStart : '-'}
        />
        <InfoDetail
          label="Tot"
          value={vergunning?.timeEnd ? vergunning.timeEnd : '-'}
        />
      </InfoDetailGroup>
    </>
  );
}
