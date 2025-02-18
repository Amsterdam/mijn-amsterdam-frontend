import { LatLngLiteral, LatLngTuple } from 'leaflet';

import { logger } from '../../server/logging';
import { BAGQueryParams, BAGAdreseerbaarObject } from '../types/bag';

export function extractAddress(rawText: string): BAGQueryParams {
  if (!rawText) {
    throw 'Cannot extract address out of an empty string';
  }

  // Remove everything but alphanumeric, dash, dot, apostrophe and space.
  const cleanText = rawText.replace(/[^/'0-9-.\s\p{Script=Latin}+]/giu, '');

  const [textWithoutPostalCode, postalCode] = extractPostalCode(cleanText);
  const [, address] = extractAddressInfo(textWithoutPostalCode);

  return {
    openbareruimteNaam: address?.streetname,
    huisnummer: address?.huisnummer,
    huisnummertoevoeging: address?.huisnummertoevoeging,
    postcode: postalCode,
    // Leave out huisletter. This is used to look up a location on the map,
    // and it's okay to show an approximate location.
    huisletter: undefined,
  };
}

type PostalCode = string;

function extractPostalCode(text: string): [string, PostalCode | undefined] {
  const onPostalCode = new RegExp(/[1-9][0-9]{3} ?(?!sa|sd|ss)[a-z]{2}/i);

  const postcodeMatch = text.match(onPostalCode);
  if (postcodeMatch) {
    return [
      text.replace(onPostalCode, '').trim(),
      postcodeMatch[0].replace(' ', ''),
    ];
  }
  return [text, undefined];
}

type Address = {
  streetname?: string;
  huisnummer?: number;
  huisnummertoevoeging?: string;
};

function extractAddressInfo(text: string): [string, Address | undefined] {
  const onAddress = new RegExp(
    /([\w.'/\- \p{L}]+) (\w?[0-9]+[0-9\-\p{L} ]*)/iu
  );
  const addressMatch = text.match(onAddress);

  if (addressMatch) {
    const houseNumberPart = addressMatch[2];

    const [huisnummer, huisnummertoevoeging] = houseNumberPart
      ? splitHuisnummerFromToevoeging(houseNumberPart)
      : [undefined, undefined];

    let huisNummerInt;
    if (huisnummer) {
      try {
        huisNummerInt = parseInt(huisnummer);
      } catch (err) {
        logger.error(err, `Could not parse '${huisnummer}' to an integer`);
      }
    }

    return [
      text.replace(onAddress, '').trim(),
      {
        streetname: addressMatch[1],
        huisnummer: huisNummerInt,
        huisnummertoevoeging,
      },
    ];
  }

  return [text, undefined];
}

function splitHuisnummerFromToevoeging(
  s: string
): [string, string | undefined] | undefined {
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
