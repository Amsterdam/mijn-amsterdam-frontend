import { defaultDateFormat } from '../../../universal/helpers';
import InfoDetail, {
  InfoDetailGroup,
} from '../../components/InfoDetail/InfoDetail';
import { BZP as BZPType } from '../../../server/services/vergunningen';

export function BZP({ vergunning }: { vergunning: BZPType }) {
  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning?.identifier || '-'} />
      <InfoDetail label="Zaaktype" value={vergunning.caseType || '-'} />
      <InfoDetail label="Kenteken" value={vergunning.kenteken || '-'} />
      <InfoDetailGroup>
        <InfoDetail
          label="Vanaf"
          value={
            vergunning?.dateStart
              ? defaultDateFormat(vergunning.dateStart)
              : '-'
          }
        />
        <InfoDetail
          label="Tot en met"
          value={
            vergunning?.dateEnd ? defaultDateFormat(vergunning.dateEnd) : '-'
          }
        />
      </InfoDetailGroup>
      {!!vergunning?.decision && (
        <InfoDetail label="Resultaat" value={vergunning.decision} />
      )}
    </>
  );
}
