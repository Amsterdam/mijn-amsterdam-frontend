import { LatLngLiteral, LatLngTuple } from 'leaflet';

import { BAGQueryParams, BAGAdreseerbaarObject } from '../types/bag';

// Quick and dirty see also: https://stackoverflow.com/a/68401047
export function extractAddress(rawAddress: string): BAGQueryParams {
  // Strip down to Street + Housenumber
  const address = rawAddress
    // Remove everything but alphanumeric, dash, dot and space
    .replace(/[^0-9-.\s\p{Script=Latin}+]/giu, '');

  const words = [];
  const s = address.split(' ');

  if (s.length < 2) {
    throw Error(
      `Address should consist of minimally two parts. A streetname and a housenumber.
      Address: '${address}'`
    );
  }

  let i = 0;

  for (; i < s.length; i++) {
    const word = s[i];
    if (word[0].match(/\d/)) {
      // The first housenumber found, so there are no more streetname words left.
      break;
    }
    words.push(word);
  }
  const openbareruimteNaam = words.join(' ');
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
    openbareruimteNaam,
    huisnummer: parseInt(huisnummer),
    huisnummertoevoeging,
    // RP TODO: What is huisletter in the query? I already added one with a letter but this counts
    // as toevoeging.
    // There is also mention of a dot in replacing trash characters. What to do when there is a dot?
    huisletter: undefined,
  };
}

function splitHuisnummerFromToevoeging(
  s: string
): [string, string | undefined] {
  const huisnummer = [];
  const huisnummertoevoeging = [];
  let i = 0;

  for (; i < s.length; i++) {
    if (!s[i].match(/\d/)) {
      break;
    }
    huisnummer.push(s[i]);
  }
  if (s[i] === '-') {
    // Consume the character.
    i++;

    for (; i < s.length; i++) {
      huisnummertoevoeging.push(s[i]);
    }
  } else {
    for (; i < s.length; i++) {
      if (!s[i].match(/[a-z]/i)) {
        throw Error(
          `Unexpected character in huisnummer + toevoeging. Character: '${s[i]}'`
        );
      }
      huisnummertoevoeging.push(s[i]);
    }
  }

  return [huisnummer.join(''), huisnummertoevoeging.join('') || undefined];
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

function formatAddress(result: BAGAdreseerbaarObject) {
  if (result.huisletter) {
    throw Error(
      `RP TODO: Huisletter found, how should this fit in formatting?
And what if there is also a huisnummertoevoeging?`
    );
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
