import type { BZP as BZPVergunning } from '../../../../server/services/vergunningen/vergunningen';
import { defaultDateFormat } from '../../../../universal/helpers/date';
import InfoDetail, {
  InfoDetailGroup,
} from '../../../components/InfoDetail/InfoDetail';

export function BZP({ vergunning }: { vergunning: BZPVergunning }) {
  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning?.identifier || '-'} />
      <InfoDetail label="Kenteken" value={vergunning.kenteken || '-'} />
      {!!vergunning.dateStart &&
        !!vergunning.dateEnd &&
        vergunning.decision === 'Verleend' &&
        vergunning.status === 'Afgehandeld' && (
          <InfoDetailGroup>
            <InfoDetail
              label="Vanaf"
              value={defaultDateFormat(vergunning.dateStart)}
            />
            <InfoDetail
              label="Tot en met"
              value={defaultDateFormat(vergunning.dateEnd)}
            />
          </InfoDetailGroup>
        )}
      {!!vergunning?.decision && (
        <InfoDetail label="Resultaat" value={vergunning.decision} />
      )}
    </>
  );
}
