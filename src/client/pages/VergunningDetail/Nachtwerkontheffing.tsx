import { Location } from './Location';
import styles from './VergunningDetail.module.scss';
import type { Nachtwerkontheffing as NachtwerkontheffingType } from '../../../server/services';
import { defaultDateFormat } from '../../../universal/helpers/date';
import InfoDetail, {
  InfoDetailGroup,
} from '../../components/InfoDetail/InfoDetail';

export function Nachtwerkontheffing({
  vergunning,
}: {
  vergunning: NachtwerkontheffingType;
}) {
  const isVerleend = vergunning.processed && vergunning.decision === 'Verleend';
  const isAfgehandeld = vergunning.processed;
  const isSameDate =
    vergunning.dateStart === vergunning.dateEnd || vergunning.dateEnd === null;

  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning.identifier || '-'} />
      <Location location={vergunning.location} />

      {isVerleend && !isSameDate && (
        <InfoDetailGroup>
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
            value={`${vergunning.timeStart} - ${vergunning.timeEnd} uur`}
          />
        </InfoDetailGroup>
      )}
      {isVerleend && isSameDate && (
        <InfoDetailGroup>
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
