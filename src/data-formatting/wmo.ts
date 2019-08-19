import { AppRoutes } from 'App.constants';
import slug from 'slug';
import { LinkProps } from '../App.types';
import { defaultDateFormat } from '../helpers/App';

// Example data
// [
//   {
//     Omschrijving: 'ambulante ondersteuning',
//     Wet: 1,
//     Actueel: true,
//     Volume: 1,
//     Eenheid: '82',
//     Frequentie: 3,
//     Leveringsvorm: 'ZIN',
//     Omvang: '1 stuks per vier weken',
//     Leverancier: 'Leger des Heils',
//     Checkdatum: '2019-10-09T00:00:00',
//     Voorzieningsoortcode: 'AO5',
//     Voorzieningcode: '021',
//     Aanvraagdatum: '2018-11-20T00:00:00',
//     Beschikkingsdatum: '2018-11-22T00:00:00',
//     VoorzieningIngangsdatum: '2018-11-20T00:00:00',
//     VoorzieningEinddatum: '2019-11-20T00:00:00',
//     Levering: {
//       Opdrachtdatum: '2018-11-22T00:00:00',
//       Leverancier: 'Z00118',
//       IngangsdatumGeldigheid: '2018-11-20T00:00:00',
//       EinddatumGeldigheid: '2019-11-20T00:00:00',
//       StartdatumLeverancier: '2018-11-20T00:00:00',
//       EinddatumLeverancier: null,
//     },
//   },
// ];

export interface WmoItem {
  id: string;
  title: string; // Omschrijving
  dateStart: string; // Startdatum
  dateFinish?: string; // Einddatum
  supplier: string; // Leverancier
  supplierUrl: string; // Leverancier url
  qtyDescription: string; // Omvang: e.g 1 stuks per beschikking
  isActual: boolean; // Actueel
  link: LinkProps;
}

interface WmoApiLevering {
  Opdrachtdatum: string;
  Leverancier: string;
  IngangsdatumGeldigheid: string;
  EinddatumGeldigheid: string;
  StartdatumLeverancier: string;
  EinddatumLeverancier: string | null;
}

interface WmoApiItem {
  Omschrijving: string;
  Wet: number;
  Actueel: boolean;
  Volume: number;
  Eenheid: string;
  Frequentie: number;
  Leveringsvorm: string;
  Omvang: string;
  Leverancier: string;
  Checkdatum: string;
  Voorzieningsoortcode: string;
  Voorzieningcode: string;
  Aanvraagdatum: string;
  Beschikkingsdatum: string;
  VoorzieningIngangsdatum: string;
  VoorzieningEinddatum: string;
  Levering: WmoApiLevering;
}

export type WmoApiResponse = WmoApiItem[];

export function formatWmoApiResponse(
  wmoApiResponseData: WmoApiResponse
): WmoItem[] {
  return wmoApiResponseData.map((item, index) => {
    const {
      Omschrijving: title,
      VoorzieningIngangsdatum: dateStart,
      VoorzieningEinddatum: dateFinish,
      Leverancier: supplier,
      Omvang: qtyDescription,
      Actueel: isActual,
    } = item;
    const [start] = dateStart.split('T');
    const [finish] = dateFinish ? dateFinish.split('T') : ['aanvraag'];
    const id = slug(`${title}-${start}-${finish}-${index}`).toLowerCase();
    return {
      id,
      title,
      dateStart: defaultDateFormat(dateStart),
      dateFinish: dateFinish && defaultDateFormat(dateFinish),
      supplier,
      // TODO: See if we can get a url to the suppliers websites
      supplierUrl: '',
      qtyDescription,
      isActual,
      link: {
        title: 'Meer info',
        to: `${AppRoutes.ZORG_VOORZIENINGEN}/${id}`,
      },
    };
  });
}
