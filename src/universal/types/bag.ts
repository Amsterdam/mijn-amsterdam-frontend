/** An incomplete slice of a BAG adresseerbaar object.
 *  That is because not all fields are used.
 */
export type BAGAdreseerbaarObject = {
  identificatie: string;
  huisnummer: number;
  huisletter: string | null;
  huisnummertoevoeging: string | null;
  postcode: string;
  woonplaatsNaam: string;
  openbareruimteNaam: string; // Also know as straatnaam.
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
}

/** Query Parameters for doing Axios requests to BAG_ADRESSEERBARE_OBJECTEN. */
export type BAGQueryParams = {
  openbareruimteNaam?: string;
  postcode?: string;
  huisnummer?: string;
  huisletter?: string;
  huisnummertoevoeging?: string;
};
