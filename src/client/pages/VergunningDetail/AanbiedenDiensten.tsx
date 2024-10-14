import { Location } from './Location';
import styles from './VergunningDetail.module.scss';
import type { AanbiedenDiensten as AanbiedenDienstenVergunning } from '../../../server/services';
import { defaultDateFormat } from '../../../universal/helpers/date';
import { InfoDetail } from '../../components';
import { InfoDetailGroup } from '../../components/InfoDetail/InfoDetail';

export function AanbiedenDiensten({
  vergunning,
}: {
  vergunning: AanbiedenDienstenVergunning;
}) {
  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning?.identifier || '-'} />
      {vergunning.decision && (
        <InfoDetail label="Resultaat" value={vergunning.decision} />
      )}
      {!!vergunning.location && vergunning.decision === 'Verleend' && (
        <Location location={vergunning.location} />
      )}
      {vergunning.decision === 'Verleend' &&
        (vergunning.dateEnd == null ||
          vergunning.dateStart === vergunning.dateEnd) && (
          <InfoDetail
            label="Op"
            value={
              vergunning?.dateStart
                ? defaultDateFormat(vergunning.dateStart)
                : '-'
            }
          />
        )}
      {vergunning.decision === 'Verleend' &&
        vergunning.dateEnd !== null &&
        vergunning.dateStart !== vergunning.dateEnd && (
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
              label="Tot"
              value={
                vergunning?.dateEnd
                  ? defaultDateFormat(vergunning.dateEnd)
                  : '-'
              }
            />
          </InfoDetailGroup>
        )}
    </>
  );
}
