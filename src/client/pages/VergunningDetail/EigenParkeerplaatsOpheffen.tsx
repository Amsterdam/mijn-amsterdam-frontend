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

  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning.identifier || '-'} />
      <InfoDetail
        label="Verzoek"
        value={`Opheffing ${
          vergunning.isCarsharingpermit ? 'autodeelbedrijf' : ''
        }`}
      />

      <Location
        label="Adres"
        location={`${vergunning.street} ${vergunning.houseNumber}`}
      />
      <InfoDetail label="Soortplek" value={vergunning.locationType} />
      {vergunning.locationUrl && (
        <InfoDetail
          label="Parkeervak"
          value={
            <Linkd href={vergunning.locationUrl} external={true}>
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
