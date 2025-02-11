import type { EigenParkeerplaats } from '../../../../server/services/parkeren/config-and-types';
import type { VergunningFrontend } from '../../../../server/services/vergunningen/config-and-types';
import { Datalist, Row } from '../../../components/Datalist/Datalist';
import {
  commonTransformers,
  getRows,
} from '../../Vergunningen/detail-page-content/fields-config';

export function EigenParkeerplaats({
  vergunning,
}: {
  vergunning: VergunningFrontend<EigenParkeerplaats>;
}) {
  const isVerleend = vergunning.processed && vergunning.decision === 'Verleend';
  const isAfgehandeld = vergunning.processed;

  const rows = getRows(vergunning, [
    'identifier',
    {
      requestTypes: (vergunning: VergunningFrontend<EigenParkeerplaats>) => {
        return {
          label: 'Verzoek',
          content:
            vergunning.requestTypes.length > 1 ? (
              <ul>
                {vergunning.requestTypes.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            ) : (
              vergunning.requestTypes[0]
            ),
        };
      },
    },
    {
      locations: (vergunning: VergunningFrontend<EigenParkeerplaats>) => {
        const rows: Row[] = [];
        // vergunning.locations?.map((location, i) => {
        //     return (
        //       <div key={JSON.stringify(location)}>
        //         <Location
        //           label={`Adres ${vergunning.locations?.length == 2 ? i + 1 : ''}`}
        //           location={`${location.street} ${location.houseNumber}`}
        //         />
        //         {!!location.type && (
        //           <InfoDetail label="Soort plek" value={location.type} />
        //         )}
        //         {!!location.url && (
        //           <InfoDetail
        //             label="Parkeervak"
        //             value={
        //               <Link rel="noreferrer" variant="inline" href={location.url}>
        //                 Bekijk parkeervak
        //               </Link>
        //             }
        //           />
        //         )}
        //       </div>
        //     );
        //   })
        return {
          rows,
        };
      },
    },
    'kentekens',
    {
      vorigeKentekens: (vergunning) => {
        return vergunning.requestTypes.some(
          (type) => type === 'Kentekenwijziging'
        ) && 'vorigeKentekens' in vergunning
          ? {
              label: 'Oud kenteken',
              content: vergunning.vorigeKentekens || '-',
            }
          : null;
      },
    },
    {
      dateStart: (vergunning) => {
        return isVerleend ? commonTransformers.dateStart(vergunning) : null;
      },
    },
    {
      dateEnd: (vergunning) => {
        return isVerleend ? commonTransformers.dateEnd(vergunning) : null;
      },
    },
    'decision',
  ]);

  return <Datalist rows={rows} />;
}
