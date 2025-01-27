import type {
  VergunningFrontendV2,
  ZwaarVerkeer,
} from '../../../../server/services/vergunningen/config-and-types';
import { defaultDateFormat } from '../../../../universal/helpers/date';
import InfoDetail, {
  InfoDetailGroup,
} from '../../../components/InfoDetail/InfoDetail';

export function ZwaarVerkeer({
  vergunning,
}: {
  vergunning: VergunningFrontendV2;
}) {
  const vergunningData = vergunning as VergunningFrontendV2<ZwaarVerkeer>;
  const isAfgehandeld = vergunningData.processed;

  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunningData.identifier || '-'} />

      <InfoDetail
        label="Soort ontheffing"
        value={vergunningData.exemptionKind || '-'}
      />

      <InfoDetail label="Kentekens" value={vergunningData.kentekens || '-'} />

      <InfoDetailGroup>
        <InfoDetail
          label="Vanaf"
          value={
            vergunningData.dateStart
              ? defaultDateFormat(vergunningData.dateStart)
              : '-'
          }
        />
        <InfoDetail
          label="Tot en met"
          value={
            vergunningData.dateEnd
              ? defaultDateFormat(vergunningData.dateEnd)
              : '-'
          }
        />
      </InfoDetailGroup>

      {isAfgehandeld && (
        <InfoDetail label="Resultaat" value={vergunningData.decision} />
      )}
    </>
  );
}
