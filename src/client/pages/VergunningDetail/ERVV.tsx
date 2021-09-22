import { ERVV as ERVVType } from '../../../server/services';
import InfoDetail, {
  InfoDetailGroup,
} from '../../components/InfoDetail/InfoDetail';
import { Location } from './Location';
import {
  defaultDateFormat,
  defaultDateTimeFormat,
} from '../../../universal/helpers/date';

export function ERVV({ vergunning }: { vergunning: ERVVType }) {
  const isVerleend = vergunning?.decision === 'Verleend';
  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning?.identifier || '-'} />
      <InfoDetail label="Soort vergunning" value={vergunning.caseType || '-'} />
      <InfoDetail label="Omschrijving" value={vergunning?.description || '-'} />
      {!!vergunning.location && <Location location={vergunning.location} />}
      <InfoDetailGroup>
        <InfoDetail
          label="Vanaf"
          value={
            vergunning?.timeStart && vergunning?.dateStart && isVerleend
              ? defaultDateTimeFormat(
                  `${vergunning.dateStart}T${vergunning.timeStart}`
                )
              : vergunning.dateStart && isVerleend
              ? defaultDateFormat(vergunning.dateStart)
              : '-'
          }
        />
        <InfoDetail
          label="Tot en met"
          value={
            vergunning?.timeEnd && vergunning?.dateEnd && isVerleend
              ? defaultDateTimeFormat(
                  `${vergunning.dateEnd}T${vergunning.timeEnd}`
                )
              : vergunning.dateEnd && isVerleend
              ? defaultDateFormat(vergunning.dateEnd)
              : '-'
          }
        />
      </InfoDetailGroup>
      {!!vergunning?.decision && (
        <InfoDetail label="Resultaat" value={vergunning.decision} />
      )}
    </>
  );
}
