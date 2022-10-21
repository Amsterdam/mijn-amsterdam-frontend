import type { Nachtwerkontheffing as NachtwerkontheffingType } from '../../../server/services';
import {
  dateTimeFormatYear,
  defaultDateFormat,
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
  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning.identifier || '-'} />
      {!!vergunning.location && <Location location={vergunning.location} />}

      {!!vergunning.decision && (
        <InfoDetailGroup>
          <InfoDetail
            label="Vanaf"
            value={
              vergunning.timeStart && vergunning.dateStart
                ? dateTimeFormatYear(
                    `${vergunning.dateStart}T${vergunning.timeStart}`
                  )
                : vergunning.dateStart
                ? defaultDateFormat(vergunning.dateStart)
                : '-'
            }
          />
          <InfoDetail
            label="Tot en met"
            value={
              vergunning.timeEnd && vergunning.dateEnd
                ? dateTimeFormatYear(
                    `${vergunning.dateEnd}T${vergunning.timeEnd}`
                  )
                : vergunning.dateEnd
                ? defaultDateFormat(vergunning.dateEnd)
                : '-'
            }
          />
        </InfoDetailGroup>
      )}
      {!!vergunning.decision && (
        <InfoDetail label="Resultaat" value={vergunning.decision} />
      )}
    </>
  );
}
