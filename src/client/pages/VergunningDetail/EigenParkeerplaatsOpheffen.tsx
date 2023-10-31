import type { EigenParkeerplaatsOpheffen as EigenParkeerplaatsOpheffenType } from '../../../server/services';
import { Linkd } from '../../components';
import InfoDetail from '../../components/InfoDetail/InfoDetail';
import { Location } from './Location';

export function EigenParkeerplaatsOpheffen({
  vergunning,
}: {
  vergunning: EigenParkeerplaatsOpheffenType;
}) {
  const isAfgehandeld = vergunning.processed;
  const { street, type, url, houseNumber } = vergunning.location;

  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning.identifier || '-'} />
      <InfoDetail
        label="Verzoek"
        value={`Opheffing ${
          vergunning.isCarsharingpermit ? 'autodeelbedrijf' : ''
        }`}
      />

      <Location label="Adres" location={`${street} ${houseNumber}`} />

      {type && <InfoDetail label="Soortplek" value={type} />}

      {url && (
        <InfoDetail
          label="Parkeervak"
          value={
            <Linkd href={url} external={true}>
              Bekijk parkeervak
            </Linkd>
          }
        />
      )}

      {isAfgehandeld && (
        <InfoDetail label="Resultaat" value={vergunning.decision} />
      )}
    </>
  );
}
