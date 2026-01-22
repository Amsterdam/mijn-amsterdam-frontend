import {
  AANVRAAG,
  EINDE_RECHT,
  getTransformerConfigBesluit,
  IN_BEHANDELING,
  isDecisionWithDeliveryStatusActive,
  isDelivered,
  isDeliveredStatusActive,
  isOpdrachtGegeven,
  isOpdrachtGegevenVisible,
  MEER_INFORMATIE,
} from './wmo-generic';
import {
  ProductSoortCode,
  ZorgnedAanvraagTransformed,
  ZorgnedStatusLineItemTransformerConfig,
} from '../../zorgned/zorgned-types';

export const hulpmiddelen: ZorgnedStatusLineItemTransformerConfig[] = [
  AANVRAAG,
  IN_BEHANDELING,
  MEER_INFORMATIE,
  getTransformerConfigBesluit(isDecisionWithDeliveryStatusActive, true),
  {
    status: 'Opdracht gegeven',
    datePublished: (aanvraag) => aanvraag.datumOpdrachtLevering ?? '',
    isVisible: isOpdrachtGegevenVisible,
    isChecked: (aanvraag, today) => isOpdrachtGegeven(aanvraag, today),
    isActive: (aanvraag, today) =>
      aanvraag.isActueel &&
      isOpdrachtGegeven(aanvraag, today) &&
      !isDelivered(aanvraag, today),
    description: (aanvraag) =>
      `<p>Wij hebben ${aanvraag.leverancier} gevraagd om een ${aanvraag.titel} aan u te leveren.</p>`,
  },
  {
    status: 'Product geleverd',
    datePublished: (aanvraag) => aanvraag.datumBeginLevering ?? '',
    isVisible: isOpdrachtGegevenVisible,
    isChecked: (aanvraag, today) =>
      isOpdrachtGegeven(aanvraag, today) && isDelivered(aanvraag, today),
    isActive: (aanvraag, today: Date) =>
      isDeliveredStatusActive(aanvraag, today),
    description: (aanvraag, today) =>
      isOpdrachtGegeven(aanvraag, today) && isDelivered(aanvraag, today)
        ? `<p>${aanvraag.leverancier} heeft ons laten weten dat een ${aanvraag.titel} bij u is afgeleverd.</p>`
        : '',
  },
  EINDE_RECHT,
];

/** Config for adding or adjusting disclaimers that need to show up when a zorgned voorziening has been wrongfuly closed but then opened again.
 *
 *  The dates are to identify which voorzieningen are actually part of what should be one voorziening.
 *  So if you have: ingang = 2024-01-31 and einde = 2024-02-01. Then we will -
 *  show a disclaimer text on the actual one and the non actual (einde) one.
 *
 *  @param {string} actual - Disclaimer text for items that are actual.
 *  @param {string} notActual - Disclaimer text for items that are non actual.
 *  @param {string} datumEindeGeldigheid - The date in yyyy-mm-dd format, when the voorziening was wrongfuly ended.
 *  @param {string} datumIngangGeldigheid - The date in yyyy-mm-dd format, when the voorziening is opened again.
 */
type HulpmiddelenDisclaimerConfig = {
  actual: string;
  notActual: string;
  datumEindeGeldigheid: string;
  datumIngangGeldigheid: string;
};

const hulpmiddelenDisclaimerConfigs: {
  generic: HulpmiddelenDisclaimerConfig;
} & Record<ProductSoortCode, HulpmiddelenDisclaimerConfig> = {
  generic: {
    actual:
      'Door een fout kan het zijn dat dit hulpmiddel ook bij "Eerdere en afgewezen voorzieningen" staat. Daar vindt u dan het originele besluit met de juiste datums.',
    notActual:
      'Door een fout kan het zijn dat dit hulpmiddel ten onrechte bij "Eerdere en afgewezen voorzieningen" staat.',
    datumEindeGeldigheid: '2024-10-31',
    datumIngangGeldigheid: '2024-11-01',
  },
  GBW: {
    actual:
      'Het kan zijn dat uw gesloten buitenwagen hieronder “Huidige voorzieningen” een verkeerde startdatum heeft. Kijk voor de juiste startdatum bij eerdere en afgewezen voorzieningen.',
    notActual:
      'Het kan zijn dat uw gesloten buitenwagen ten onrechte bij hieronder "Eerdere en afgewezen voorzieningen" staat. De actieve voorziening staat ook onder "Huidige voorzieningen".',
    datumEindeGeldigheid: '31-12-2025',
    datumIngangGeldigheid: '2026-01-01',
  },
};

/**
 * Er zijn een aantal voorzieningen in Zorgned gekopieerd naar nieuwe voorzieningen.
 * De oude voorzieningen zijn afgesloten (einde recht).
 * De nieuwe voorzieningen zijn niet voorzien van een besluit document waardoor de besluit status niet zichtbaar is.
 */
export function getHulpmiddelenDisclaimer(
  detailAanvraag: ZorgnedAanvraagTransformed,
  aanvragen: ZorgnedAanvraagTransformed[]
): string | undefined {
  const config =
    hulpmiddelenDisclaimerConfigs[detailAanvraag.productsoortCode] ??
    hulpmiddelenDisclaimerConfigs.generic;

  const hasNietActueelMatch =
    detailAanvraag.isActueel &&
    detailAanvraag.datumIngangGeldigheid === config.datumIngangGeldigheid &&
    aanvragen.some(
      (aanvraag) =>
        aanvraag.datumEindeGeldigheid === config.datumEindeGeldigheid &&
        !aanvraag.isActueel
    );

  const hasActueelMatch =
    !detailAanvraag.isActueel &&
    detailAanvraag.datumEindeGeldigheid === config.datumEindeGeldigheid &&
    aanvragen.some(
      (aanvraag) =>
        aanvraag.datumIngangGeldigheid === config.datumIngangGeldigheid &&
        aanvraag.isActueel
    );

  if (hasNietActueelMatch) {
    return 'Door een fout kan het zijn dat dit hulpmiddel ook bij "Eerdere en afgewezen voorzieningen" staat. Daar vindt u dan het originele besluit met de juiste datums.';
  } else if (hasActueelMatch) {
    return 'Door een fout kan het zijn dat dit hulpmiddel ten onrechte bij "Eerdere en afgewezen voorzieningen" staat.';
  }

  return undefined;
}
