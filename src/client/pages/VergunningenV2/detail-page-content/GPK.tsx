import type { GPK as GPKType } from '../../../../server/services';
import { defaultDateFormat } from '../../../../universal/helpers/date';
import InfoDetail from '../../../components/InfoDetail/InfoDetail';

export function GPK({ vergunning }: { vergunning: GPKType }) {
  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning?.identifier || '-'} />
      <InfoDetail label="Kaart nummer" value={vergunning?.cardNumber || '-'} />
      <InfoDetail label="Soort kaart" value={vergunning?.cardtype || '-'} />
      <InfoDetail
        label="Verval datum"
        value={vergunning.dateEnd ? defaultDateFormat(vergunning.dateEnd) : ''}
      />
      {!!vergunning?.decision && (
        <InfoDetail label="Resultaat" value={vergunning.decision} />
      )}
    </>
  );
}
