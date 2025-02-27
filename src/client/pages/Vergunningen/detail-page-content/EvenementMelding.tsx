import { Location } from './Location';
import type {
  EvenementMelding,
  VergunningFrontend,
} from '../../../../server/services/vergunningen/config-and-types';
import { defaultDateFormat } from '../../../../universal/helpers/date';
import InfoDetail, {
  InfoDetailGroup,
} from '../../../components/InfoDetail/InfoDetail';

export function EvenementMelding({
  vergunning,
}: {
  vergunning: VergunningFrontend;
}) {
  const vergunningData = vergunning as VergunningFrontend<EvenementMelding>;
  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunningData.identifier || '-'} />
      {!!vergunningData.location && (
        <Location location={vergunningData.location} />
      )}

      <InfoDetailGroup>
        <InfoDetail
          label="Op"
          value={
            vergunningData.dateStart
              ? defaultDateFormat(vergunningData.dateStart)
              : '-'
          }
        />
        <InfoDetail
          label="Van"
          value={
            vergunningData.timeStart ? `${vergunningData.timeStart} uur` : '-'
          }
        />
        <InfoDetail
          label="Tot"
          value={vergunningData.timeEnd ? `${vergunningData.timeEnd} uur` : '-'}
        />
      </InfoDetailGroup>
      {!!vergunningData.decision && (
        <InfoDetail label="Resultaat" value={vergunningData.decision} />
      )}
    </>
  );
}
