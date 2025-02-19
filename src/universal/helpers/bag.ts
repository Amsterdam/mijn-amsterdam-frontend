import { LatLngLiteral, LatLngTuple } from 'leaflet';

import { BAGQueryParams, BAGAdreseerbaarObject } from '../types/bag';

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
    pattern: /(?<![0-9a-z])[a-z_.'/\-\p{L} ]+(?![0-9a-z])/iu,
  },
  huisnummer: {
    pattern: /\d+/i,
    formatter: (huisnummer) => parseInt(huisnummer),
  },
  huisnummertoevoeging: { pattern: /\w/i },
};

export function extractAddress(rawText: string): BAGQueryParams {
  if (!rawText) {
    throw 'Cannot extract address out of an empty string';
  }

  const cleanText = rawText
    // Remove everything but alphanumeric, dash, dot, apostrophe and space.
    .replace(/[^/'0-9-.\s\p{Script=Latin}+]/giu, '')
    .replace('Amsterdam', '');

  const [, result] = Object.entries(patterns).reduce(extract, [cleanText, {}]);

  return result;
}

type Text = string;

function extract(
  acc: [Text, BAGQueryParams],
  namedPattern: [string, ExtractUtils]
): [Text, BAGQueryParams] {
  const [name, utils] = namedPattern;
  const { pattern, formatter } = utils;

  const [text, bagQueryParams] = acc;
  if (!text) {
    return acc;
  }

  const match = text.match(pattern);
  if (!match) {
    return acc;
  }

  const newText = text.replace(pattern, '').trim();
  const matchedText = formatter ? formatter(match[0]) : match[0];

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
