import { defaultDateFormat, formatMonthAndYear, formatYear } from './date.ts';
import type { Persoon } from '../../server/services/profile/brp.types.ts';

export function getFullName(
  persoon: Pick<
    Persoon,
    'voornamen' | 'geslachtsnaam' | 'voorvoegselGeslachtsnaam'
  >
) {
  return persoon
    ? `${persoon.voornamen} ${
        persoon.voorvoegselGeslachtsnaam
          ? persoon.voorvoegselGeslachtsnaam + ' '
          : ''
      }${persoon.geslachtsnaam}`.trim()
    : '';
}

export function getFullAddress(
  adres: {
    straatnaam: string | null;
    huisnummer: string | null;
    huisnummertoevoeging: string | null;
    huisletter: string | null;
    postcode: string | null;
    woonplaatsNaam: string | null;
    land?: string | null;
  } | null,
  includePostCodeWoonplaats = false,
  includeLand = false,
  separator = '\n'
) {
  if (!adres?.straatnaam) {
    return 'onbekend adres';
  }
  return adres
    ? `${adres.straatnaam} ${adres.huisnummer || ''} ${
        adres.huisletter || ''
      } ${adres.huisnummertoevoeging || ''}`.trim() +
        (includePostCodeWoonplaats
          ? `${separator}${adres.postcode || ''}${
              adres.woonplaatsNaam ? ' ' + adres.woonplaatsNaam : ''
            }` + (includeLand && adres.land ? `${separator}${adres.land}` : '')
          : '')
    : 'onbekend adres';
}

export function isMokum(
  brpContent: { mokum?: boolean; persoon?: { mokum: boolean } } | null
) {
  return !!brpContent?.persoon?.mokum || !!brpContent?.mokum;
}

export function hasDutchNationality(
  brpContent: {
    persoon: { nationaliteiten: Array<{ omschrijving: string }> | null };
  } | null
) {
  const nationaliteiten = brpContent?.persoon?.nationaliteiten || [];
  return nationaliteiten.some(
    ({ omschrijving }) => omschrijving === 'Nederlandse'
  );
}

export function hasDutchAndOtherNationalities(
  brpContent: {
    persoon: { nationaliteiten: Array<{ omschrijving: string }> | null };
  } | null
) {
  const nationaliteiten = brpContent?.persoon?.nationaliteiten || [];
  return (
    nationaliteiten.length > 1 &&
    nationaliteiten.some(({ omschrijving }) => omschrijving === 'Nederlandse')
  );
}

export function formatBirthdate(
  indicatie: Persoon['indicatieGeboortedatum'],
  geboortedatum: string
) {
  if (indicatie === 'J') {
    return '00 00 0000';
  }

  if (indicatie === 'M') {
    return `00 00 ${formatYear(geboortedatum)}`;
  }

  if (indicatie === 'D') {
    return `00 ${formatMonthAndYear(geboortedatum)}`;
  }

  return defaultDateFormat(geboortedatum);
}
