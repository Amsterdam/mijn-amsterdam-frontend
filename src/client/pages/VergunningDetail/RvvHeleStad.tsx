import type { RVVHeleStad } from '../../../server/services';
import { InfoDetail } from '../../components';

export function RvvHeleStad({ vergunning }: { vergunning: RVVHeleStad }) {
  const isAfgehandeld = vergunning.processed;

  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning.identifier} />

      {isAfgehandeld && (
        <InfoDetail label="Resultaat" value={vergunning.decision} />
      )}
      <InfoDetail label="Kenteken(s)" value={vergunning.licencePlates || '-'} />

      <InfoDetail label="Van" value={vergunning.dateStart} />

      <InfoDetail label="Tot en met" value={vergunning.dateEnd} />
    </>
  );
}
