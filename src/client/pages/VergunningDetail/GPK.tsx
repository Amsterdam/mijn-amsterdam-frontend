import { GPK as GPKType } from '../../../server/services';
import InfoDetail from '../../components/InfoDetail/InfoDetail';

export function GPK({ vergunning }: { vergunning: GPKType }) {
  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning?.identifier || '-'} />
      <InfoDetail
        label="Soort vergunning"
        value={vergunning?.caseType || '-'}
      />
      <InfoDetail label="Omschrijving" value={vergunning?.title || '-'} />
      <InfoDetail label="Locatie" value={vergunning?.location || '-'} />
      <InfoDetail
        label="Reden aanvraag"
        value={vergunning?.requestReason || '-'}
      />
      <InfoDetail
        label="Bestuurder/Passagier"
        value={vergunning?.driverPassenger || '-'}
      />
      {!!vergunning?.decision && (
        <InfoDetail label="Resultaat" value={vergunning.decision} />
      )}
    </>
  );
}
