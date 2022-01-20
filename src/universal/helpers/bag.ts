import { BAGSourceData } from '../types/bag';

export function extractAddress(rawAddress: string) {
  // Strip down to Street + Housenumber
  const address = rawAddress
    // Remove everything but alphanumeric, dash and space
    .replace(/[^a-z0-9-\s]/gi, '')
    // Remove woonplaats
    .replace(/(Amsterdam|Weesp)/gi, '')
    // Remove postalcode
    .replace(/([1-9][0-9]{3} ?(?!sa|sd|ss)[a-z]{2})/i, '')
    .trim();

  return address;
}

export type BAGSearchAddress = string;

export function getLatLonByAddress(
  results: BAGSourceData['results'] = [],
  bagSearchAddress: BAGSearchAddress,
  isWeesp: boolean
) {
  if (!!results.length) {
    const result1 = results.find((result) => {
      const isWoonplaatsMatch =
        result.woonplaats === (isWeesp ? 'Weesp' : 'Amsterdam');
      const isAddressMatch = result.adres.includes(bagSearchAddress);
      return isWoonplaatsMatch && isAddressMatch;
    });

    if (result1 && result1.adres && result1.centroid) {
      const [lng, lat] = result1.centroid;
      return { lat, lng };
    }
  }
  return null;
}

export function getBagSearchAddress(adres: {
  straatnaam: string | null;
  huisnummer: string | null;
}): BAGSearchAddress {
  return adres.straatnaam && adres.huisnummer
    ? `${adres.straatnaam} ${adres.huisnummer || ''}`.trim()
    : 'onbekend-adres';
}

export function isLocatedInWeesp(address: string) {
  const lAddress = address.toLowerCase();
  return lAddress.includes('weesp') && !lAddress.includes('amsterdam');
}
