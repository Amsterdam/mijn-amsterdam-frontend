import { GPP as GPPType } from '../../../server/services';
import InfoDetail from '../../components/InfoDetail/InfoDetail';
import { Location } from './Location';

export function GPP({ vergunning }: { vergunning: GPPType }) {
  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning?.identifier || '-'} />
      <InfoDetail
        label="Soort vergunning"
        value={vergunning?.caseType || '-'}
      />
      <InfoDetail label="Omschrijving" value={vergunning?.title || '-'} />
      {!!vergunning.location && <Location location={vergunning.location} />}
      <InfoDetail label="Kenteken" value={vergunning?.kenteken || '-'} />

      {!!vergunning?.decision && (
        <InfoDetail label="Resultaat" value={vergunning.decision} />
      )}
    </>
  );
}
