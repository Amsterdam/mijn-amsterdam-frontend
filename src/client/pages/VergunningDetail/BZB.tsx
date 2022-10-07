import { defaultDateFormat } from '../../../universal/helpers';
import InfoDetail, {
  InfoDetailGroup,
} from '../../components/InfoDetail/InfoDetail';

import type { BZB as BZBVergunning } from '../../../server/services/vergunningen/vergunningen';
import { ExpirationdNotifications } from './BZP';

export function BZB({ vergunning }: { vergunning: BZBVergunning }) {
  return (
    <>
      <ExpirationdNotifications id={vergunning.id} />
      <InfoDetail label="Kenmerk" value={vergunning?.identifier || '-'} />
      <InfoDetail label="Naam bedrijf" value={vergunning.companyName || '-'} />
      <InfoDetail
        label="Aantal aangevraagde ontheffingen"
        value={vergunning.numberOfPermits}
      />
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
      {!!vergunning.decision && (
        <InfoDetail label="Resultaat" value={vergunning.decision} />
      )}
    </>
  );
}
