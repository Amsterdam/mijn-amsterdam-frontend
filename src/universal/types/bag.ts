/** An incomplete slice of a BAG adresseerbaar object.
 *  That is because not all fields are used.
 */
export type BAGAdreseerbaarObject = {
  identificatie: string;
  volgnummer: number;
  huisnummer: number;
  huisletter: string | null;
  huisnummertoevoeging: string | null;
  postcode: string;
  documentdatum: string; // In '2019-02-04' format
  adresseerbaarObjectPuntGeometrieWgs84: {
    type: 'Point';
    coordinates: [number, number]; // In long lat order. (lowest number first)
  };
};

/** An incomplete slice of a adreseerbare object response.
 *  That is because not all fields are used.
 */
export interface BAGSourceData {
  _embedded: {
    adresseerbareobjecten: BAGAdreseerbaarObject[];
  };
  page: {
    number: number;
    size: number;
  };
}

/** Query Parameters for doing Axios requests to BAG_ADRESSEERBARE_OBJECTEN. */
export type BAGQueryParams = {
  openbareruimteNaam: string;
  huisnummer: string;
  huisletter?: string;
};
