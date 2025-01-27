import {
  TouringcarDagontheffing,
  TouringcarJaarontheffing,
} from '../../../../server/services/vergunningen-v2/config-and-types';
import {
  dateTimeFormatYear,
  defaultDateFormat,
} from '../../../../universal/helpers/date';
import { CaseTypeV2 } from '../../../../universal/types/decos-zaken';
import { InfoDetail } from '../../../components';
import { InfoDetailGroup } from '../../../components/InfoDetail/InfoDetail';

export function Touringcar({
  vergunning,
}: {
  vergunning: TouringcarDagontheffing | TouringcarJaarontheffing;
}) {
  const isGranted = vergunning.decision === 'Verleend';

  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning.identifier} />

      {vergunning.caseType === CaseTypeV2.TouringcarJaarontheffing ? (
        <InfoDetail
          valueWrapperElement="div"
          label={vergunning.routetest ? 'Kenteken' : 'Kenteken(s)'}
          value={
            vergunning.kentekens?.includes(' | ') ? (
              <ul>
                {vergunning.kentekens
                  ?.split(' | ')
                  .map((plate, index) => <li key={plate + index}>{plate}</li>)}
              </ul>
            ) : (
              vergunning.kentekens
            )
          }
        />
      ) : (
        <InfoDetail label="Kenteken" value={vergunning.kentekens} />
      )}

      <InfoDetail label="Bestemming" value={vergunning.destination} />

      {isGranted &&
        vergunning.caseType === CaseTypeV2.TouringcarJaarontheffing && (
          <InfoDetailGroup>
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
          </InfoDetailGroup>
        )}

      {isGranted &&
        vergunning.caseType === CaseTypeV2.TouringcarDagontheffing && (
          <InfoDetailGroup>
            <InfoDetail
              label="Van"
              value={
                vergunning?.timeStart && vergunning?.dateStart
                  ? dateTimeFormatYear(
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
                  ? dateTimeFormatYear(
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
