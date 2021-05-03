import { GPP as GPPType } from '../../../server/services';
import InfoDetail from '../../components/InfoDetail/InfoDetail';

export function GPP({ vergunning }: { vergunning: GPPType }) {
  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning?.identifier || '-'} />
      <InfoDetail
        label="Soort vergunning"
        value={vergunning?.caseType || '-'}
      />
      <InfoDetail label="Omschrijving" value={vergunning?.title || '-'} />
      <InfoDetail label="Kenteken" value={vergunning?.kenteken || '-'} />
      <InfoDetail label="Locatie" value={vergunning?.location || '-'} />
      {!!vergunning?.decision && (
        <InfoDetail label="Resultaat" value={vergunning.decision} />
      )}
    </>
  );
}
