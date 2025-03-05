import { Location } from './Location';
import type { EvenementMelding } from '../../../../server/services/vergunningen-v2/config-and-types';
import { defaultDateFormat } from '../../../../universal/helpers/date';
import InfoDetail, {
  InfoDetailGroup,
} from '../../../components/InfoDetail/InfoDetail';

export function EvenementMelding({
  vergunning,
}: {
  vergunning: EvenementMelding;
}) {
  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning?.identifier || '-'} />
      {!!vergunning.location && <Location location={vergunning.location} />}

      <InfoDetailGroup>
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
