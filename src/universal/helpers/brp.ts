import { Persoon, Adres, BRPData } from '../types';

export function getFullName(persoon: Persoon) {
  return (
    persoon.opgemaakteNaam ||
    `${persoon.voornamen} ${
      persoon.voorvoegselGeslachtsnaam
        ? persoon.voorvoegselGeslachtsnaam + ' '
        : ''
    }${persoon.geslachtsnaam}`
  );
}

export function getFullAddress(adres: Adres) {
  return `${adres.straatnaam} ${adres.huisnummer || ''} ${adres.huisletter ||
    ''} ${adres.huisnummertoevoeging || ''}`;
}

export function getBagSearchAddress(adres: Adres) {
  return `${adres.straatnaam} ${adres.huisnummer || ''}`;
}

export function isMokum(brpContent: BRPData | null) {
  return !!brpContent?.persoon.mokum;
}
