import {
  ToeristischeVerhuurBBVergunning,
  ToeristischeVerhuurVergunningaanvraag,
} from '../../../server/services';
import { defaultDateFormat } from '../../../universal/helpers';
import InfoDetail, {
  InfoDetailGroup,
} from '../../components/InfoDetail/InfoDetail';

export default function VergunningVerhuur({
  vergunning,
}: {
  vergunning:
    | ToeristischeVerhuurVergunningaanvraag
    | ToeristischeVerhuurBBVergunning;
}) {
  return (
    <>
      <InfoDetail
        label="Gemeentelijke zaaknummer"
        value={vergunning?.identifier ?? '-'}
      />
      <InfoDetailGroup>
        <InfoDetail
          label="Vanaf"
          value={
            vergunning.dateStart ? defaultDateFormat(vergunning.dateStart) : '-'
          }
        />
        <InfoDetail
          label="Tot"
          value={
            vergunning.dateEnd ? defaultDateFormat(vergunning.dateEnd) : '-'
          }
        />
      </InfoDetailGroup>
      {vergunning.caseType === 'B&B - vergunning' && (
        <InfoDetailGroup>
          <InfoDetail label="Eigenaar woning" value={'-'} />
          <InfoDetail label="Aanvrager vergunning" value={'-'} />
        </InfoDetailGroup>
      )}
      <InfoDetail label="Adres" value={vergunning?.location ?? '-'} />
    </>
  );
}
