import type { Nachtwerkontheffing as NachtwerkontheffingType } from '../../../server/services';
import {
  defaultDateFormat,
  defaultDateTimeFormat,
} from '../../../universal/helpers';
import InfoDetail, {
  InfoDetailGroup,
} from '../../components/InfoDetail/InfoDetail';
import { Location } from './Location';

export function Nachtwerkontheffing({
  vergunning,
}: {
  vergunning: NachtwerkontheffingType;
}) {
  const startTime = vergunning?.timeStart
    ? vergunning.timeStart.replace('.', ':')
    : null;
  const endTime = vergunning?.timeEnd
    ? vergunning.timeEnd.replace('.', ':')
    : null;

  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning?.identifier || '-'} />
      {!!vergunning.location && <Location location={vergunning.location} />}

      {!!vergunning?.decision && (
        <InfoDetailGroup>
          <InfoDetail
            label="Vanaf"
            value={
              startTime && vergunning?.dateStart
                ? defaultDateTimeFormat(`${vergunning.dateStart}T${startTime}`)
                : vergunning.dateStart
                ? defaultDateFormat(vergunning.dateStart)
                : '-'
            }
          />
          <InfoDetail
            label="Tot en met"
            value={
              endTime && vergunning?.dateEnd
                ? defaultDateTimeFormat(`${vergunning.dateEnd}T${endTime}`)
                : vergunning.dateEnd
                ? defaultDateFormat(vergunning.dateEnd)
                : '-'
            }
          />
        </InfoDetailGroup>
      )}
      {!!vergunning?.decision && (
        <InfoDetail label="Resultaat" value={vergunning.decision} />
      )}
    </>
  );
}
