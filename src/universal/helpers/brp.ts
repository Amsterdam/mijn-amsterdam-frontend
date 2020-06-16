import { Persoon, Adres, BRPData } from '../types';

export function getFullName(persoon: Persoon) {
  return persoon
    ? (
        persoon.opgemaakteNaam ||
        `${persoon.voornamen} ${
          persoon.voorvoegselGeslachtsnaam
            ? persoon.voorvoegselGeslachtsnaam + ' '
            : ''
        }${persoon.geslachtsnaam}`
      ).trim()
    : '';
}

export function getFullAddress(adres: Adres) {
  return adres
    ? `${adres.straatnaam} ${adres.huisnummer || ''} ${adres.huisletter ||
        ''} ${adres.huisnummertoevoeging || ''}`.trim()
    : 'unknown address';
}

export function getBagSearchAddress(adres: Adres) {
  return adres
    ? `${adres.straatnaam} ${adres.huisnummer || ''}`.trim()
    : 'unknown address';
}

export function isMokum(brpContent: BRPData | null) {
  return !!brpContent?.persoon?.mokum;
}
