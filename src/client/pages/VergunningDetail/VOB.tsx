import type { Ligplaatsvergunning } from '../../../server/services';
import InfoDetail from '../../components/InfoDetail/InfoDetail';
import { Location } from './Location';

export function VOB({ vergunning }: { vergunning: Ligplaatsvergunning }) {
  const isAfgehandeld = vergunning.processed;

  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning?.identifier || '-'} />
      {!!vergunning.location && <Location location={vergunning.location} />}
      <InfoDetail
        label="Soort aanvraag"
        value={vergunning?.requestKind || '-'}
      />
      <InfoDetail label="Reden" value={vergunning?.reason || '-'} />

      <InfoDetail
        label="Soort vaartuig"
        value={vergunning?.vesselKind || '-'}
      />
      <InfoDetail label="Naam vaartuig" value={vergunning?.vesselName || '-'} />

      {isAfgehandeld && (
        <InfoDetail label="Resultaat" value={vergunning.decision} />
      )}
    </>
  );
}
