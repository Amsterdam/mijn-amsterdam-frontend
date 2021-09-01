import { defaultDateFormat } from '../../../universal/helpers';
import InfoDetail, {
  InfoDetailGroup,
} from '../../components/InfoDetail/InfoDetail';
import { BZB as BZBVergunning } from '../../../server/services/vergunningen';

export function BZB({ vergunning }: { vergunning: BZBVergunning }) {
  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning?.identifier || '-'} />
      <InfoDetail label="Soort vergunning" value={vergunning.caseType || '-'} />
      <InfoDetail label="Naam bedrijf" value={vergunning.companyName || '-'} />
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
