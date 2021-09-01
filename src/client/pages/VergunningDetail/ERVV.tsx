import { ERVV as ERVVType } from '../../../server/services';
import {
  defaultDateFormat,
  defaultDateTimeFormat,
} from '../../../universal/helpers';
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
            vergunning?.dateStart
              ? defaultDateTimeFormat(vergunning.dateStart)
              : '-'
          }
        />
        <InfoDetail
          label="Tot en met"
          value={
            vergunning?.dateEnd
              ? defaultDateTimeFormat(vergunning.dateEnd)
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
