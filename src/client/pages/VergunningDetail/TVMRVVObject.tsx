import { TVMRVVObject as TVMRVVObjectType } from '../../../server/services';
import { defaultDateFormat } from '../../../universal/helpers';
import InfoDetail, {
  InfoDetailGroup,
} from '../../components/InfoDetail/InfoDetail';

export function TVMRVVObject({ vergunning }: { vergunning: TVMRVVObjectType }) {
  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning?.identifier || '-'} />
      <InfoDetail
        label="Soort vergunning"
        value={vergunning?.caseType || '-'}
      />
      <InfoDetail label="Omschrijving" value={vergunning?.title || '-'} />
      <InfoDetail label="Locatie" value={vergunning?.location || '-'} />
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
