import type { WoningVergunning } from '../../../universal/helpers/vergunningen';
import InfoDetail from '../../components/InfoDetail/InfoDetail';
import { Location } from './Location';

export function Woonvergunningen({
  vergunning,
}: {
  vergunning: WoningVergunning;
}) {
  const isAfgehandeld = vergunning.processed;

  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning?.identifier || '-'} />
      {!!vergunning.location && <Location location={vergunning.location} />}
      {isAfgehandeld && (
        <InfoDetail label="Resultaat" value={vergunning.decision} />
      )}
    </>
  );
}
