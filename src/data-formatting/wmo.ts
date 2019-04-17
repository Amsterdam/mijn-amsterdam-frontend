import slug from 'slug';
import { defaultDateFormat, dateFormat } from '../helpers/App';

// Example data
//  {
//     "Omschrijving": "handbewogen rolstoel",
//     "Wet": 1,
//     "Actueel": false,
//     "Startdatum": "2014-04-14T00:00:00",
//     "Einddatum": "2014-04-24T00:00:00",
//     "Volume": 1,
//     "Eenheid": "82",
//     "Frequentie": 6,
//     "Leveringsvorm": "ZIN",
//     "Omvang": "1 stuks per beschikking",
//     "Leverancier": "Welzorg",
//     "Checkdatum": null,
//     "PGBbudget": []
//   },
export interface WmoItem {
  id: string;
  title: string; // Omschrijving
  dateStart: string; // Startdatum
  dateFinish?: string; // Einddatum
  supplier: string; // Leverancier
  qtyDescription: string; // Omvang: e.g 1 stuks per beschikking
  isActual: boolean; // Actueel
}

interface WmoApiItem {
  Omschrijving: string;
  Startdatum: string;
  Einddatum: string;
  Leverancier: string;
  Omvang: string;
  Actueel: boolean;
}

export type WmoApiResponse = WmoApiItem[];

export function formatWmoApiResponse(
  wmoApiResponseData: WmoApiResponse
): WmoItem[] {
  return wmoApiResponseData.map(item => {
    const {
      Omschrijving: title,
      Startdatum: dateStart,
      Einddatum: dateFinish,
      Leverancier: supplier,
      Omvang: qtyDescription,
      Actueel: isActual,
    } = item;
    const [start] = dateStart.split('T');
    const [finish] = dateFinish ? dateFinish.split('T') : ['aanvraag'];
    return {
      id: slug(`${title}-${start}-${finish}`).toLowerCase(),
      title,
      dateStart: dateFormat(dateStart, 'DD MMM YYYY'),
      dateFinish: dateFinish && dateFormat(dateFinish, 'DD MMM YYYY'),
      supplier,
      qtyDescription,
      isActual,
    };
  });
}
