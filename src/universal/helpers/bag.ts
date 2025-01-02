import { LatLngLiteral, LatLngTuple } from 'leaflet';

import { BAGQueryParams, BAGAdreseerbaarObject } from '../types/bag';

export function extractAddress(rawAddress: string): BAGQueryParams {
  // Remove everything but alphanumeric, dash, dot, apostrophe and space.
  const address = rawAddress.replace(/[^/'0-9-.\s\p{Script=Latin}+]/giu, '');

  const words = [];
  const s = address.split(' ');

  if (s.length < 2) {
    throw Error(
      `Address should consist of minimally two parts. A streetname and a housenumber.
      Address: '${address}'`
    );
  }

  let i = 0;
  const onDigit = new RegExp(/\d/);

  for (; i < s.length; i++) {
    const word = s[i];
    if (word[0].match(onDigit)) {
      // The first housenumber found, so there are no more streetname words left.
      break;
    }
    words.push(word);
  }

  // We know now that we're past the street name so now we can index into the last identifying part.
  const houseIdentifier = s[i];
  if (!houseIdentifier) {
    throw Error(
      `No houseIdentifier part, can't parse incomplete address: '${address}'`
    );
  }

  const [huisnummer, huisnummertoevoeging] =
    splitHuisnummerFromToevoeging(houseIdentifier);

  return {
    openbareruimteNaam: words.join(' '),
    huisnummer: parseInt(huisnummer),
    huisnummertoevoeging,
    // Leave out huisletter. This is used to look up a location on the map,
    // and it's okay to show an approximate location.
    huisletter: undefined,
  };
}

function splitHuisnummerFromToevoeging(
  s: string
): [string, string | undefined] {
  const huisnummer = [];
  const huisnummertoevoeging = [];
  let i = 0;

  // Matches something like 1, 2-5 or 3F.
  const matches = s.match(/(\d+)-?(\d*|\w*)?/);
  if (!matches) {
    throw Error(
      `Match failed for housenumber and/or toevoeging. Input string: '${s}'`
    );
  }
  return [matches[1], matches[2]];
}

export type BAGSearchAddress = string;

export type LatLngWithAddress = LatLngLiteral & { address: string };

/** Find a matching object in adresseerbareObjecten.
 *
 *  A Match is a object where both the same adres as residency is found.
 *  It's possible for the same street name to exist in both Weesp and Amsterdam.
 *  So this prevents selecting the wrong one.
 */
export function getMatchingBagResult(
  adresseerbareObjecten: BAGAdreseerbaarObject[] = [],
  bagSearchAddress: BAGQueryParams,
  isWeesp: boolean
) {
  const foundAdresseerbaarObject = adresseerbareObjecten.find(
    (adresseerbaarObject) => {
      const isWoonplaatsMatch =
        adresseerbaarObject.woonplaatsNaam ===
        (isWeesp ? 'Weesp' : 'Amsterdam');

      const isAddressMatch =
        adresseerbaarObject.openbareruimteNaam ===
          bagSearchAddress.openbareruimteNaam &&
        adresseerbaarObject.huisnummer === bagSearchAddress.huisnummer &&
        adresseerbaarObject.huisletter ===
          (bagSearchAddress.huisletter ?? null);

      return isWeesp ? isWoonplaatsMatch && isAddressMatch : isAddressMatch;
    }
  );

  return foundAdresseerbaarObject ?? null;
}

export function getLatLngWithAddress(
  result: BAGAdreseerbaarObject
): LatLngWithAddress {
  return {
    address: formatAddress(result),
    ...(getLatLngCoordinates(
      result.adresseerbaarObjectPuntGeometrieWgs84.coordinates
    ) ?? null),
  };
}

function formatAddress(result: BAGAdreseerbaarObject): string {
  if (result.huisletter) {
    throw Error('Huisletter found but formatting not implemented.');
  }
  if (result.huisnummertoevoeging) {
    return `${result.openbareruimteNaam} ${result.huisnummer}-${result.huisnummertoevoeging}`;
  }
  return `${result.openbareruimteNaam} ${result.huisnummer}`;
}

export function getLatLngCoordinates(centroid: LatLngTuple) {
  // Forced coordinates to be in the right order
  // Using Amsterdam lat/lng 52.xxxxxx, 4.xxxxxx
  const [A, B] = centroid;
  const lat = A < B ? B : A;
  const lng = B > A ? A : B;
  return { lat, lng };
}

export function getLatLonByAddress(
  adresseerbareObjecten: BAGAdreseerbaarObject[] = [],
  bagSearchAddress: BAGQueryParams,
  isWeesp: boolean
): LatLngWithAddress | null {
  if (adresseerbareObjecten.length) {
    const result = getMatchingBagResult(
      adresseerbareObjecten,
      bagSearchAddress,
      isWeesp
    );
    if (
      result &&
      result.openbareruimteNaam &&
      result.adresseerbaarObjectPuntGeometrieWgs84.coordinates
    ) {
      return getLatLngWithAddress(result);
    }
  }
  return null;
}

export function isLocatedInWeesp(address: string) {
  const lAddress = address.toLowerCase();
  // NOTE: Currently no addresses including "amsterdam" are present in Weesp. So: Amsterdamse plein or Amsterdamse straatweg do not exist.
  // Should this change in the future, this function won't hold up anymore and a more comprehensive test should be incorporated here.
  return lAddress.includes('weesp') && !lAddress.includes('amsterdam');
}
