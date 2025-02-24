import type { RVVHeleStad } from '../../../../server/services';
import { defaultDateFormat } from '../../../../universal/helpers/date';
import { InfoDetail } from '../../../components';
import { InfoDetailGroup } from '../../../components/InfoDetail/InfoDetail';

export function RvvHeleStad({ vergunning }: { vergunning: RVVHeleStad }) {
  const isAfgehandeld = vergunning.processed;

  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning.identifier} />

      <InfoDetail label="Kenteken(s)" value={vergunning.licensePlates || '-'} />

      <InfoDetailGroup>
        <InfoDetail
          label="Van"
          value={
            vergunning.dateStart ? defaultDateFormat(vergunning.dateStart) : '-'
          }
        />

        <InfoDetail
          label="Tot en met"
          value={
            vergunning.dateEnd ? defaultDateFormat(vergunning.dateEnd) : '-'
          }
        />
      </InfoDetailGroup>

      {isAfgehandeld && (
        <InfoDetail label="Resultaat" value={vergunning.decision} />
      )}
    </>
  );
}
