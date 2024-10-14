import { Location } from './Location';
import styles from './VergunningDetail.module.scss';
import type { EvenementMelding as EvenementMeldingType } from '../../../server/services';
import { defaultDateFormat } from '../../../universal/helpers/date';
import InfoDetail, {
  InfoDetailGroup,
} from '../../components/InfoDetail/InfoDetail';

export function EvenementMelding({
  vergunning,
}: {
  vergunning: EvenementMeldingType;
}) {
  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning?.identifier || '-'} />
      {!!vergunning.location && <Location location={vergunning.location} />}

      <InfoDetailGroup className={styles.EvenementMelding_DateAndTime}>
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
      {!!vergunning?.decision && (
        <InfoDetail label="Resultaat" value={vergunning.decision} />
      )}
    </>
  );
}
