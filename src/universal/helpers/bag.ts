import { LatLngLiteral, LatLngTuple } from 'leaflet';

import {
  BAGQueryParams,
  BAGAdreseerbaarObject,
  BAGSourceDataResponse,
  BAGSourceData,
} from '../types/bag';

// Quick and dirty see also: https://stackoverflow.com/a/68401047
export function extractAddress(rawAddress: string): BAGQueryParams {
  // Strip down to Street + Housenumber
  const address = rawAddress
    // Remove everything but alphanumeric, dash, dot and space
    .replace(/[^0-9-\.\s\p{Script=Latin}+]/giu, '')
    // Remove woonplaats
    .replace(/(Amsterdam|Weesp)/gi, '')
    // Remove postalcode
    .replace(/([1-9][0-9]{3} ?(?!sa|sd|ss)[a-z]{2})/i, '')
    .trim();

  const words = [];
  const s = address.split(' ');

  let i = 0;

  for (; i < s.length; i++) {
    const word = s[i];
    if (word.match(/\d.+/)) {
      break;
    }
    words.push(word);
  }
  const openbareruimteNaam = words.join(' ');
  // We know now that we're past the street name so now we can index into the house number.
  const housenumber = s[i];
  i++;

  // eslint-disable-next-line prefer-const
  let [huisnummer, huisletter] = splitHouseNumberFromLetter(housenumber);

  // It might have a space after the housenumber, so check one index further.
  if (!huisletter) {
    huisletter = s[i] ?? undefined; // undefined params do not get rendered while empty ones do.
  }

  return {
    openbareruimteNaam,
    huisnummer,
    huisletter,
  };
}

function splitHouseNumberFromLetter(s: string): string[] {
  const last = s.length - 1;
  if (s[last].match(/[a-z]/i)) {
    return [s.slice(0, last), s[last]];
  }
  return [s, ''];
}

export type BAGSearchAddress = string;

export type LatLngWithAddress = LatLngLiteral & { address: string };

export function getMatchingBagResult(
  results: BAGSourceDataResponse['results'] = [],
  bagSearchAddress: BAGSearchAddress,
  isWeesp: boolean
) {
  const result1 = results.find((result) => {
    const isWoonplaatsMatch =
      result.woonplaats === (isWeesp ? 'Weesp' : 'Amsterdam');

    const isAddressMatch = result.adres
      .toLowerCase()
      .includes(bagSearchAddress.toLowerCase());

    return isWeesp ? isWoonplaatsMatch && isAddressMatch : isAddressMatch;
  });

  return result1 ?? null;
}

export function getLatLngWithAddress(
  result: BAGAdreseerbaarObject
): LatLngWithAddress {
  return {
    address: result.adres,
    ...(getLatLngCoordinates(result.centroid) ?? null),
  };
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
  adresseerbareObjecten: BAGSourceData['_embedded']['adresseerbareobjecten'] = [],
  bagSearchAddress: BAGSearchAddress,
  isWeesp: boolean
): LatLngWithAddress | null {
  if (adresseerbareObjecten.length) {
    const result1 = getMatchingBagResult(
      adresseerbareObjecten,
      bagSearchAddress,
      isWeesp
    );
    if (result1 && result1.adres && result1.centroid) {
      return getLatLngWithAddress(result1);
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
