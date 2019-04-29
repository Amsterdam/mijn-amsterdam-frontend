import slug from 'slug';
import { defaultDateFormat, dateFormat } from '../helpers/App';
import { AppRoutes } from 'App.constants';
import { LinkProps } from '../App.types';

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
  supplierUrl: string; // Leverancier url
  qtyDescription: string; // Omvang: e.g 1 stuks per beschikking
  isActual: boolean; // Actueel
  link: LinkProps;
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
  return wmoApiResponseData.map((item, index) => {
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
    const id = slug(`${title}-${start}-${finish}-${index}`).toLowerCase();
    return {
      id,
      title,
      dateStart: dateFormat(dateStart, 'DD MMM YYYY'),
      dateFinish: dateFinish && dateFormat(dateFinish, 'DD MMM YYYY'),
      supplier,
      // TODO: See if we can get a url to the suppliers websites
      supplierUrl: supplier
        ? `https://${supplier.replace(/\s/gi, '-').toLowerCase()}.nl`
        : '',
      qtyDescription,
      isActual,
      link: {
        title: 'Meer info',
        to: `${AppRoutes.ZORG}/${id}`,
      },
    };
  });
}
