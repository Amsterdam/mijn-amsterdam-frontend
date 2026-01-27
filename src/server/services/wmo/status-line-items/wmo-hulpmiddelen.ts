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
 *  @param codes - List of product codes this config applies to
 *  @param actual - Disclaimer text for actual items
 *  @param notActual - Disclaimer text for non-actual item
 *  @param datePairs - Pairs of start and end dates in yyyy-hh-dd format
 */
type ConfigValue = {
  codes: ProductSoortCode[];
  actual: string;
  notActual: string;
  datePairs: DatePairs;
};

type DatePairs = [string, string][];

export type HulpmiddelenDisclaimerConfig = ConfigValue[];

export const hulpmiddelenDisclaimerConfig: HulpmiddelenDisclaimerConfig = [
  {
    // For all other productcodes.
    codes: [],
    actual:
      'Door een fout kan het zijn dat dit hulpmiddel ook bij "Eerdere en afgewezen voorzieningen" staat. Daar vindt u dan het originele besluit met de juiste datums.',
    notActual:
      'Door een fout kan het zijn dat dit hulpmiddel ten onrechte bij "Eerdere en afgewezen voorzieningen" staat.',
    datePairs: [['2024-10-31', '2024-11-01']],
  },
  {
    codes: ['GBW'],
    actual:
      'Het kan zijn dat uw gesloten buitenwagen hieronder "Huidige voorzieningen" een verkeerde startdatum heeft. Kijk voor de juiste startdatum bij eerdere en afgewezen voorzieningen.',
    notActual:
      'Het kan zijn dat uw gesloten buitenwagen ten onrechte bij hieronder "Eerdere en afgewezen voorzieningen" staat. De actieve voorziening staat ook onder "Huidige voorzieningen".',
    datePairs: [['2025-12-31', '2026-01-01']],
  },
];

function isDateMatch(
  datePairs: DatePairs,
  aanvraagDate: string | null,
  key: keyof Pick<
    ZorgnedAanvraagTransformed,
    'datumIngangGeldigheid' | 'datumEindeGeldigheid'
  >
): boolean {
  if (!aanvraagDate) {
    return false;
  }
  return datePairs.some(([endDate, startDate]) => {
    return key === 'datumEindeGeldigheid'
      ? aanvraagDate === endDate
      : aanvraagDate === startDate;
  });
}

/**
 * Er zijn een aantal voorzieningen in Zorgned gekopieerd naar nieuwe voorzieningen.
 * De oude voorzieningen zijn afgesloten (einde recht).
 * De nieuwe voorzieningen zijn niet voorzien van een besluit document waardoor de besluit status niet zichtbaar is.
 */
export function getHulpmiddelenDisclaimer(
  disclaimerConfigs: HulpmiddelenDisclaimerConfig,
  detailAanvraag: ZorgnedAanvraagTransformed,
  aanvragen: ZorgnedAanvraagTransformed[]
): string | undefined {
  const config =
    disclaimerConfigs.find((cfg) =>
      cfg.codes.includes(detailAanvraag.productsoortCode)
    ) ?? disclaimerConfigs.find((cfg) => !cfg.codes.length);

  if (!config) {
    return undefined;
  }

  if (detailAanvraag.isActueel) {
    if (
      isDateMatch(
        config.datePairs,
        detailAanvraag.datumIngangGeldigheid,
        'datumIngangGeldigheid'
      ) &&
      aanvragen.some(
        (aanvraag) =>
          isDateMatch(
            config.datePairs,
            aanvraag.datumEindeGeldigheid,
            'datumEindeGeldigheid'
          ) && !aanvraag.isActueel
      )
    ) {
      return config.actual;
    }
  } else if (
    isDateMatch(
      config.datePairs,
      detailAanvraag.datumEindeGeldigheid,
      'datumEindeGeldigheid'
    ) &&
    aanvragen.some(
      (aanvraag) =>
        isDateMatch(
          config.datePairs,
          aanvraag.datumIngangGeldigheid,
          'datumIngangGeldigheid'
        ) && aanvraag.isActueel
    )
  ) {
    return config.notActual;
  }
}
