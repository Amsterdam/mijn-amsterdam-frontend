import { LatLngLiteral, LatLngTuple } from 'leaflet';

import {
  BAGQueryParams,
  BAGAdreseerbaarObject,
} from '../../server/services/bag/bag.types';

type ExtractUtils = {
  pattern: RegExp;
  formatter?: (s: string) => unknown;
};

// The order here is important since we delete our found pattern to make it easier for the next.
const patterns: Partial<Record<keyof BAGQueryParams, ExtractUtils>> = {
  postcode: {
    pattern: /[1-9][0-9]{3} ?(?!sa|sd|ss)[a-z]{2}/i,
    // Postcode can have a space between numbers and letters.
    formatter: (postcode: string) => postcode.replace(' ', ''),
  },
  openbareruimteNaam: {
    // @ts-ignore unicode does works
    pattern: /(?<![0-9a-z])([0-9]e)?[a-z_.'/\-\p{L} ]+(?![0-9a-z])/iu,
  },
  huisnummer: {
    pattern: /\d+/i,
  },
};

/** Extract an address from free form input. */
export function extractAddressParts(rawText: string): BAGQueryParams {
  const cleanText = rawText
    .trim()
    // Remove everything but alphanumeric, dash, dot, apostrophe and space.
    // @ts-ignore unicode does work
    .replace(/[^/'0-9-.\s\p{Script=Latin}+]/giu, '')
    // Spaces to single space.
    .replace(/\s{2,}/g, ' ');
  const [, result] = Object.entries(patterns).reduce(
    extractAddressPartFromEntry,
    [cleanText, {}]
  );
  return result;
}

function extractAddressPartFromEntry(
  addressParts: [string, BAGQueryParams],
  namedPattern: [string, ExtractUtils]
): [string, BAGQueryParams] {
  const [name, { pattern, formatter }] = namedPattern;

  const [text, bagQueryParams] = addressParts;
  if (!text) {
    return addressParts;
  }

  const match = text.match(pattern);
  if (!match) {
    return addressParts;
  }

  const matchedText = formatter ? formatter(match[0]) : match[0];

  const newText = text.replace(pattern, '').trim();
  const newAcc = {
    ...bagQueryParams,
    [name]: matchedText,
  };

  return [newText, newAcc];
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
        String(adresseerbaarObject.huisnummer) ===
          bagSearchAddress.huisnummer &&
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
