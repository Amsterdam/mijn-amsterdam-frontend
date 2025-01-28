import type { GPK } from '../../../../server/services/parkeren/config-and-types';
import { defaultDateFormat } from '../../../../universal/helpers/date';
import InfoDetail from '../../../components/InfoDetail/InfoDetail';

export function GPK({ vergunning }: { vergunning: GPK }) {
  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning?.identifier || '-'} />
      <InfoDetail label="Kaart nummer" value={vergunning?.cardNumber || '-'} />
      <InfoDetail label="Soort kaart" value={vergunning?.cardType || '-'} />
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
