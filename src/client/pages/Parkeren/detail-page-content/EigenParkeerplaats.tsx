import { Link } from '@amsterdam/design-system-react';

import type { EigenParkeerplaats } from '../../../../server/services/parkeren/config-and-types';
import { defaultDateFormat } from '../../../../universal/helpers/date';
import InfoDetail, {
  InfoDetailGroup,
} from '../../../components/InfoDetail/InfoDetail';
import { Location } from '../../Vergunningen/detail-page-content/Location';

export function EigenParkeerplaats({
  vergunning,
}: {
  vergunning: EigenParkeerplaats;
}) {
  const isVerleend = vergunning.processed && vergunning.decision === 'Verleend';
  const isAfgehandeld = vergunning.processed;

  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning.identifier || '-'} />
      <InfoDetail
        label="Verzoek"
        valueWrapperElement="div"
        value={
          vergunning.requestTypes.length > 1 ? (
            <ul>
              {vergunning.requestTypes.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          ) : (
            vergunning.requestTypes[0]
          )
        }
      />

      <InfoDetailGroup>
        {vergunning.locations?.map((location, i) => {
          return (
            <div key={JSON.stringify(location)}>
              <Location
                label={`Adres ${vergunning.locations?.length == 2 ? i + 1 : ''}`}
                location={`${location.street} ${location.houseNumber}`}
              />
              {!!location.type && (
                <InfoDetail label="Soort plek" value={location.type} />
              )}
              {!!location.url && (
                <InfoDetail
                  label="Parkeervak"
                  value={
                    <Link rel="noreferrer" variant="inline" href={location.url}>
                      Bekijk parkeervak
                    </Link>
                  }
                />
              )}
            </div>
          );
        })}
      </InfoDetailGroup>

      <InfoDetail label="Kenteken(s)" value={vergunning.kentekens} />
      {vergunning.requestTypes.some((type) => type === 'Kentekenwijziging') && (
        <InfoDetail label="Oud kenteken" value={vergunning.vorigeKentekens} />
      )}
      {isVerleend && vergunning.dateStart && (
        <InfoDetail
          label="Startdatum"
          value={defaultDateFormat(vergunning.dateStart)}
        />
      )}
      {isVerleend && vergunning.dateEnd && (
        <InfoDetail
          label="Vervaldatum"
          value={defaultDateFormat(vergunning.dateEnd)}
        />
      )}
      {isAfgehandeld && (
        <InfoDetail label="Resultaat" value={vergunning.decision} />
      )}
    </>
  );
}
