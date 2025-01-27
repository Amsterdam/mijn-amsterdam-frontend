import {
  TouringcarDagontheffing,
  TouringcarJaarontheffing,
  VergunningFrontendV2,
} from '../../../../server/services/vergunningen/config-and-types';
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
  vergunning: VergunningFrontendV2;
}) {
  const vergunningData = vergunning as VergunningFrontendV2<
    TouringcarDagontheffing | TouringcarJaarontheffing
  >;
  const isGranted = vergunning.decision === 'Verleend';

  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunningData.identifier} />

      {vergunningData.caseType === CaseTypeV2.TouringcarJaarontheffing ? (
        <InfoDetail
          valueWrapperElement="div"
          label={vergunningData.routetest ? 'Kenteken' : 'Kenteken(s)'}
          value={
            vergunningData.kentekens?.includes(' | ') ? (
              <ul>
                {vergunningData.kentekens
                  ?.split(' | ')
                  .map((plate, index) => <li key={plate + index}>{plate}</li>)}
              </ul>
            ) : (
              vergunningData.kentekens
            )
          }
        />
      ) : (
        <InfoDetail label="Kenteken" value={vergunningData.kentekens} />
      )}

      <InfoDetail label="Bestemming" value={vergunningData.destination} />

      {isGranted &&
        vergunningData.caseType === CaseTypeV2.TouringcarJaarontheffing && (
          <InfoDetailGroup>
            <InfoDetail
              label="Van"
              value={
                vergunningData.dateStart
                  ? defaultDateFormat(vergunningData.dateStart)
                  : '-'
              }
            />
            <InfoDetail
              label="Tot"
              value={
                vergunningData.dateEnd
                  ? defaultDateFormat(vergunningData.dateEnd)
                  : '-'
              }
            />
          </InfoDetailGroup>
        )}

      {isGranted &&
        vergunningData.caseType === CaseTypeV2.TouringcarDagontheffing && (
          <InfoDetailGroup>
            <InfoDetail
              label="Van"
              value={
                vergunningData?.timeStart && vergunningData?.dateStart
                  ? dateTimeFormatYear(
                      `${vergunningData.dateStart}T${vergunningData.timeStart}`
                    )
                  : vergunningData.dateStart
                    ? defaultDateFormat(vergunningData.dateStart)
                    : '-'
              }
            />
            <InfoDetail
              label="Tot"
              value={
                vergunningData?.timeEnd && vergunningData?.dateEnd
                  ? dateTimeFormatYear(
                      `${vergunningData.dateEnd}T${vergunningData.timeEnd}`
                    )
                  : vergunningData.dateEnd
                    ? defaultDateFormat(vergunningData.dateEnd)
                    : '-'
              }
            />
          </InfoDetailGroup>
        )}

      {!!vergunningData.processed && (
        <InfoDetail label="Resultaat" value={vergunningData.decision} />
      )}
    </>
  );
}
