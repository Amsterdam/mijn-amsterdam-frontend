import type { Omzettingsvergunning as OmzettingsvergunningType } from '../../../../server/services';
import InfoDetail from '../../../components/InfoDetail/InfoDetail';
import { Location } from './Location';

export function Omzettingsvergunning({
  vergunning,
}: {
  vergunning: OmzettingsvergunningType;
}) {
  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning?.identifier || '-'} />
      {!!vergunning.location && <Location location={vergunning.location} />}
      {!!vergunning?.decision && (
        <InfoDetail label="Resultaat" value={vergunning.decision} />
      )}
    </>
  );
}
