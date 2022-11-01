import type {
  Samenvoegingsvergunning as SamenvoegingsvergunningType,
  Onttrekkingsvergunning as OnttrekkingsvergunningType,
  OnttrekkingsvergunningSloop as OnttrekkingsvergunningSloopType,
  VormenVanWoonruimte as VormenVanWoonruimteType,
  Splitsingsvergunning as SplitsingsvergunningType,
} from '../../../server/services';
import InfoDetail from '../../components/InfoDetail/InfoDetail';
import { Location } from './Location';

type VergunningType =
  | SamenvoegingsvergunningType
  | OnttrekkingsvergunningType
  | OnttrekkingsvergunningSloopType
  | VormenVanWoonruimteType
  | SplitsingsvergunningType;

export function Woonvergunningen({
  vergunning,
}: {
  vergunning: VergunningType;
}) {
  const isAfgehandeld = vergunning.status === 'Afgehandeld';

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
