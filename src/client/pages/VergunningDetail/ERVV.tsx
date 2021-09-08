import { ERVV as ERVVType } from '../../../server/services';
import { defaultDateTimeFormat } from '../../../universal/helpers';
import InfoDetail, {
  InfoDetailGroup,
} from '../../components/InfoDetail/InfoDetail';
import { Location } from './Location';

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
              ? defaultDateTimeFormat(vergunning.timeStart)
              : '-'
          }
        />
        <InfoDetail
          label="Tot en met"
          value={
            vergunning?.timeEnd
              ? defaultDateTimeFormat(vergunning.timeEnd)
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
