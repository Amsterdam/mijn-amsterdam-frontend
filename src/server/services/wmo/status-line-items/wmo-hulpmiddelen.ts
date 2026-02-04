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
 *  So if you have a pair of [end = 2024-02-01, start = 2024-01-31]. Then we will -
 *  show a disclaimer text on the actual one and the non actual (ended) one.
 *
 *  Current implementation does not allow codes to be used in seperate config values.
 *
 *  @param codes - List of productsoortcodes that this config applies to.
 *  @param actual - Disclaimer text for actual items
 *  @param notActual - Disclaimer text for non-actual item
 */
type ConfigValue = {
  codes: ProductSoortCode[];
  actual: string;
  notActual: string;
  datePairs: DatePairs;
};

type DatePairs = {
  datumEindeGeldigheid: ZorgnedAanvraagTransformed['datumEindeGeldigheid'];
  datumIngangGeldigheid: ZorgnedAanvraagTransformed['datumIngangGeldigheid'];
}[];

export type HulpmiddelenDisclaimerConfig = ConfigValue[];

export const hulpmiddelenDisclaimerConfig: HulpmiddelenDisclaimerConfig = [
  {
    // For all other productcodes.
    codes: [],
    actual:
      'Door een fout kan het zijn dat dit hulpmiddel ook bij "Eerdere en afgewezen voorzieningen" staat. Daar vindt u dan het originele besluit met de juiste datums.',
    notActual:
      'Door een fout kan het zijn dat dit hulpmiddel ten onrechte bij "Eerdere en afgewezen voorzieningen" staat.',
    datePairs: [
      {
        datumEindeGeldigheid: '2024-10-31',
        datumIngangGeldigheid: '2024-11-01',
      },
    ],
  },
  {
    codes: ['GBW'],
    actual:
      'Het kan zijn dat uw gesloten buitenwagen hieronder een verkeerde startdatum heeft. Kijk voor de juiste startdatum bij "Eerdere en afgewezen voorzieningen".',
    notActual:
      'Het kan zijn dat uw gesloten buitenwagen ten onrechte bij "Eerdere en afgewezen voorzieningen" staat. Dit kunt u negeren.',
    datePairs: [
      {
        datumEindeGeldigheid: '2025-12-31',
        datumIngangGeldigheid: '2026-01-01',
      },
    ],
  },
];

/**
 * Er zijn een aantal voorzieningen in Zorgned gekopieerd naar nieuwe voorzieningen.
 * De oude voorzieningen zijn afgesloten (einde recht).
 * De nieuwe voorzieningen zijn niet voorzien van een besluit document waardoor de besluit status niet zichtbaar is.
 */
export function getHulpmiddelenDisclaimer(
  disclaimerConfig: HulpmiddelenDisclaimerConfig,
  currentAanvraag: ZorgnedAanvraagTransformed,
  aanvragen: ZorgnedAanvraagTransformed[]
): string | undefined {
  const config =
    disclaimerConfig.find((cfg) =>
      cfg.codes.includes(currentAanvraag.productsoortCode)
    ) ?? disclaimerConfig.find((cfg) => !cfg.codes.length);

  if (!config) {
    return undefined;
  }

  const isMatch = (
    dateKey: DateKey,
    oppositeDateKey: DateKey,
    disclaimer: string
  ) => {
    return isDateMatch(config.datePairs, currentAanvraag[dateKey], dateKey) &&
      hasAanvraagMatch(config, currentAanvraag, aanvragen, oppositeDateKey)
      ? disclaimer
      : undefined;
  };

  return currentAanvraag.isActueel
    ? isMatch('datumIngangGeldigheid', 'datumEindeGeldigheid', config.actual)
    : isMatch(
        'datumEindeGeldigheid',
        'datumIngangGeldigheid',
        config.notActual
      );
}

type DateKey = keyof Pick<
  ZorgnedAanvraagTransformed,
  'datumIngangGeldigheid' | 'datumEindeGeldigheid'
>;

function isDateMatch(
  datePairs: DatePairs,
  aanvraagDate: string | null,
  key: DateKey
): boolean {
  if (!aanvraagDate) {
    return false;
  }
  return datePairs.some(({ datumEindeGeldigheid, datumIngangGeldigheid }) => {
    return key === 'datumEindeGeldigheid'
      ? aanvraagDate === datumEindeGeldigheid
      : aanvraagDate === datumIngangGeldigheid;
  });
}

function hasAanvraagMatch(
  config: ConfigValue,
  currentAanvraag: ZorgnedAanvraagTransformed,
  aanvragen: ZorgnedAanvraagTransformed[],
  key: DateKey
): boolean {
  const expectedActueelValue = key === 'datumIngangGeldigheid';
  return aanvragen.some(
    (aanvraag) =>
      aanvraag.productsoortCode === currentAanvraag.productsoortCode &&
      isDateMatch(config.datePairs, aanvraag[key], key) &&
      aanvraag.isActueel === expectedActueelValue
  );
}
