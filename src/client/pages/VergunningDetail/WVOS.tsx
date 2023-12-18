import { WerkEnVervoerOpStraat } from '../../../server/services';
import { InfoDetail } from '../../components';
import { defaultDateFormat } from '../../../universal/helpers';
import { Location } from './Location';

export function WVOS({ vergunning }: { vergunning: WerkEnVervoerOpStraat }) {
  const isGranted = vergunning.decision === 'Verleend';

  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning.identifier} />

      {!!vergunning.location && <Location location={vergunning.location} />}

      <InfoDetail label="Kenteken(s)" value={vergunning.licensePlates} />

      {isGranted && (
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
            label="Tot en met"
            value={
              vergunning.dateEnd ? defaultDateFormat(vergunning.dateEnd) : '-'
            }
          />
        </>
      )}

      <InfoDetail
        label="Werkzaamheden"
        value={
          <ul>
            {(vergunning.vezip || vergunning.rvv || vergunning.eRvv) && (
              <li>
                Rijden of een voertuig neerzetten waar dat normaal niet mag
              </li>
            )}
            {vergunning.object && <li>Object neerzetten</li>}
            {(vergunning.parkingspace || vergunning.eParkingspace) && (
              <li>Parkeervakken reserveren</li>
            )}
            {vergunning.block && <li>Een straat afzetten</li>}
            {vergunning.night && <li>Werkzaamheden verrichten in de nacht</li>}
            {vergunning.bicycleRack && (
              <li>
                Fietsen en/of fietsenrekken weg laten halen voor werkzaamheden
              </li>
            )}
            {vergunning.filming && <li>Filmen</li>}
          </ul>
        }
      />

      {!!vergunning.processed && (
        <InfoDetail label="Resultaat" value={vergunning.decision} />
      )}
    </>
  );
}
