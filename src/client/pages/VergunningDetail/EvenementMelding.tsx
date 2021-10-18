import type { EvenementMelding as EvenementMeldingType } from '../../../server/services';
import { defaultDateFormat } from '../../../universal/helpers';
import InfoDetail, {
  InfoDetailGroup,
} from '../../components/InfoDetail/InfoDetail';
import { Location } from './Location';

export function EvenementMelding({
  vergunning,
}: {
  vergunning: EvenementMeldingType;
}) {
  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning?.identifier || '-'} />
      <InfoDetail label="Soort vergunning" value={vergunning.caseType || '-'} />
      {!!vergunning.location && <Location location={vergunning.location} />}

      <InfoDetailGroup>
        <InfoDetail
          label="Op"
          value={
            vergunning?.dateStart
              ? defaultDateFormat(vergunning.dateStart)
              : '-'
          }
        />
        <InfoDetail
          label="Van"
          value={vergunning?.timeStart ? vergunning.timeStart : '-'}
        />
        <InfoDetail
          label="Tot"
          value={vergunning?.timeEnd ? vergunning.timeEnd : '-'}
        />
      </InfoDetailGroup>
      {!!vergunning?.decision && (
        <InfoDetail label="Resultaat" value={vergunning.decision} />
      )}
    </>
  );
}
