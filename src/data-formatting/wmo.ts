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
  title: string; // Omschrijving
  dateStart: string; // Startdatum
  dateFinish: string; // Einddatum
  supplier: string; // Leverancier
  qtyDescription: string; // Omvang: e.g 1 stuks per beschikking
}

interface WmoApiItem {
  Omschrijving: string;
  Startdatum: string;
  Einddatum: string;
  Leverancier: string;
  Omvang: string;
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
    } = item;
    return {
      title,
      dateStart,
      dateFinish,
      supplier,
      qtyDescription,
    };
  });
}
