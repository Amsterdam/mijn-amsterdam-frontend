import type { PBZaakFieldsByName } from './powerbrowser-types.ts';

export function hasCaseTypeInFMT_CAPTION(
  caseType: string,
  pbZaakFields: PBZaakFieldsByName
) {
  const caption = pbZaakFields.FMT_CAPTION?.text;
  return !!caption && caption.includes(caseType);
}

export function hasStringInZAAKPRODUCT_ID(
  str: string,
  pbZaakFields: PBZaakFieldsByName
) {
  const product = pbZaakFields.ZAAKPRODUCT_ID?.text;
  return !!product && product.includes(str);
}

export function hasStringInZAAK_SUBPRODUCT_ID(
  str: string,
  pbZaakFields: PBZaakFieldsByName
) {
  const subProduct = pbZaakFields.ZAAK_SUBPRODUCT_ID?.text;
  return !!subProduct && subProduct.includes(str);
}

export function isZaakWithValidLowercasedResultaat(
  validResultaten: string[],
  pbZaakFields: PBZaakFieldsByName
) {
  const status = pbZaakFields.ZAAK_STATUS_ID?.text;
  if (status && status !== 'Gereed') {
    return true;
  }

  if (!('RESULTAAT_ID' in pbZaakFields)) {
    return false;
  }

  const resultaat = pbZaakFields.RESULTAAT_ID?.text?.toLowerCase();
  return !resultaat || validResultaten.includes(resultaat);
}

export function isNotBestuurlijkGevoelig(pbZaakFields: PBZaakFieldsByName) {
  const bestuursgevoelig = pbZaakFields.BESTUURLIJK_GEVOELIG?.fieldValue;
  return !bestuursgevoelig || bestuursgevoelig === 'F';
}
