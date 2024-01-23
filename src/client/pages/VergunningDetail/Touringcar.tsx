import {
  TouringcarDagontheffing,
  TouringcarJaarontheffing,
} from '../../../server/services';
import { CaseType } from '../../../universal/types/vergunningen';
import { InfoDetail } from '../../components';
import { InfoDetailGroup } from '../../components/InfoDetail/InfoDetail';
import {
  defaultDateFormat,
  defaultDateTimeFormat,
} from '../../../universal/helpers';

export function Touringcar({
  vergunning,
}: {
  vergunning: TouringcarDagontheffing | TouringcarJaarontheffing;
}) {
  const isGranted = vergunning.decision === 'Verleend';

  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning.identifier} />

      {vergunning.caseType === CaseType.TouringcarJaarontheffing ? (
        <InfoDetail label="Kenteken(s)" value={vergunning.licensePlates} />
      ) : (
        <InfoDetail label="Kenteken" value={vergunning.licensePlate} />
      )}

      <InfoDetail label="Bestemming" value={vergunning.destination} />

      {isGranted &&
        vergunning.caseType === CaseType.TouringcarJaarontheffing && (
          <>
            <InfoDetail
              label="Van"
              value={
                vergunning.dateStart
                  ? defaultDateFormat(vergunning.dateStart)
                  : '-'
              }
            />
            <InfoDetail
              label="Tot"
              value={
                vergunning.dateEnd ? defaultDateFormat(vergunning.dateEnd) : '-'
              }
            />
          </>
        )}

      {isGranted &&
        vergunning.caseType === CaseType.TouringcarDagontheffing && (
          <InfoDetailGroup>
            <InfoDetail
              label="Van"
              value={
                vergunning?.timeStart && vergunning?.dateStart
                  ? defaultDateTimeFormat(
                      `${vergunning.dateStart}T${vergunning.timeStart}`
                    )
                  : vergunning.dateStart
                    ? defaultDateFormat(vergunning.dateStart)
                    : '-'
              }
            />
            <InfoDetail
              label="Tot"
              value={
                vergunning?.timeEnd && vergunning?.dateEnd
                  ? defaultDateTimeFormat(
                      `${vergunning.dateEnd}T${vergunning.timeEnd}`
                    )
                  : vergunning.dateEnd
                    ? defaultDateFormat(vergunning.dateEnd)
                    : '-'
              }
            />
          </InfoDetailGroup>
        )}

      {!!vergunning.processed && (
        <InfoDetail label="Resultaat" value={vergunning.decision} />
      )}
    </>
  );
}
