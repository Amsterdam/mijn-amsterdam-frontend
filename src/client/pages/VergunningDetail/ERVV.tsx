import { ERVV as ERVVType } from '../../../server/services';
import { defaultDateTimeFormat } from '../../../universal/helpers';
import InfoDetail, {
  InfoDetailGroup,
} from '../../components/InfoDetail/InfoDetail';
import { Location } from './Location';
import { defaultDateFormat } from '../../../universal/helpers/date';

export function ERVV({ vergunning }: { vergunning: ERVVType }) {
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
            vergunning?.timeStart
              ? vergunning.timeStart.includes('T')
                ? defaultDateTimeFormat(vergunning.timeStart)
                : defaultDateFormat(vergunning.timeStart)
              : '-'
          }
        />
        <InfoDetail
          label="Tot en met"
          value={
            vergunning?.timeEnd
              ? vergunning.timeEnd.includes('T')
                ? defaultDateTimeFormat(vergunning.timeEnd)
                : defaultDateFormat(vergunning.timeEnd)
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
