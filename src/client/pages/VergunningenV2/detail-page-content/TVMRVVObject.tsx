import { Location } from './Location';
import type { TVMRVVObject as TVMRVVObjectType } from '../../../../server/services';
import { defaultDateFormat } from '../../../../universal/helpers/date';
import InfoDetail, {
  InfoDetailGroup,
} from '../../../components/InfoDetail/InfoDetail';

export function TVMRVVObject({ vergunning }: { vergunning: TVMRVVObjectType }) {
  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning?.identifier || '-'} />
      <InfoDetail label="Omschrijving" value={vergunning?.description || '-'} />
      {!!vergunning.location && <Location location={vergunning.location} />}
      <InfoDetailGroup>
        <InfoDetail
          label="Vanaf"
          value={
            (vergunning?.dateStart
              ? defaultDateFormat(vergunning.dateStart)
              : '-') +
            (vergunning?.timeStart ? ` - ${vergunning.timeStart} uur` : '')
          }
        />
        <InfoDetail
          label="Tot en met"
          value={
            (vergunning?.dateEnd
              ? defaultDateFormat(vergunning.dateEnd)
              : '-') +
            (vergunning?.timeEnd ? ` - ${vergunning.timeEnd} uur` : '')
          }
        />
      </InfoDetailGroup>
      {!!vergunning?.decision && (
        <InfoDetail label="Resultaat" value={vergunning.decision} />
      )}
    </>
  );
}
