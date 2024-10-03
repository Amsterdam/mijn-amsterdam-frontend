import { BAGSourceData } from '../types/bag';
import { Adres } from '../types/brp';

// Quick and dirty see also: https://stackoverflow.com/a/68401047
export function extractAddress(rawAddress: string) {
  // Strip down to Street + Housenumber
  const address = rawAddress
    // Remove everything but alphanumeric, dash, dot and space
    .replace(/[^0-9-\.\s\p{Script=Latin}+]/giu, '')
    // Remove woonplaats
    .replace(/(Amsterdam|Weesp)/gi, '')
    // Remove postalcode
    .replace(/([1-9][0-9]{3} ?(?!sa|sd|ss)[a-z]{2})/i, '')
    .trim();

  return address;
}

export type BAGSearchAddress = string;

export function getBagResult(
  results: BAGSourceData['results'] = [],
  bagSearchAddress: BAGSearchAddress,
  isWeesp: boolean
) {
  const result1 = results.find((result) => {
    const isWoonplaatsMatch =
      result.woonplaats === (isWeesp ? 'Weesp' : 'Amsterdam');

    const isAddressMatch = result.adres
      .toLowerCase()
      .includes(bagSearchAddress.toLowerCase());

    return isWoonplaatsMatch && isAddressMatch;
  });

  return result1 ?? null;
}

export function getLatLonByAddress(
  results: BAGSourceData['results'] = [],
  bagSearchAddress: BAGSearchAddress,
  isWeesp: boolean
) {
  if (results.length) {
    const result1 = getBagResult(results, bagSearchAddress, isWeesp);

    if (result1 && result1.adres && result1.centroid) {
      const [lng, lat] = result1.centroid;
      return { lat, lng };
    }
  }
  return null;
}

export function getBagSearchAddress(adres: Adres): BAGSearchAddress | null {
  let bagZoekAdres =
    adres.straatnaam && adres.huisnummer
      ? `${adres.straatnaam} ${adres.huisnummer}`.trim()
      : null;

  if (bagZoekAdres && adres.huisletter) {
    bagZoekAdres += `${adres.huisletter}`; // Bijvoorbeeld Herengracht 50C
  }

  if (bagZoekAdres && adres.huisnummertoevoeging) {
    bagZoekAdres += `-${adres.huisnummertoevoeging}`; // Bijvoorbeeld Da Costakade 50-1
  }

  return bagZoekAdres;
}

export function isLocatedInWeesp(address: string) {
  const lAddress = address.toLowerCase();
  // NOTE: Currently no addresses including "amsterdam" are present in Weesp. So: Amsterdamse plein or Amsterdamse straatweg do not exist.
  // Should this change in the future, this function won't hold up anymore and a more comprehensive test should be incorporated here.
  return lAddress.includes('weesp') && !lAddress.includes('amsterdam');
}
