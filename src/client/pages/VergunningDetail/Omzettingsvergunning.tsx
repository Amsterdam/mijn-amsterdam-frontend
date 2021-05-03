import { Omzettingsvergunning as OmzettingsvergunningType } from '../../../server/services';
import InfoDetail from '../../components/InfoDetail/InfoDetail';
import { Location } from './Location';

export function Omzettingsvergunning({
  vergunning,
}: {
  vergunning: OmzettingsvergunningType;
}) {
  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning?.identifier || '-'} />
      <InfoDetail
        label="Soort vergunning"
        value={vergunning?.caseType || '-'}
      />
      <InfoDetail label="Omschrijving" value={vergunning?.title || '-'} />
      {!!vergunning.location && <Location location={vergunning.location} />}
      {!!vergunning?.decision && (
        <InfoDetail label="Resultaat" value={vergunning.decision} />
      )}
    </>
  );
}
