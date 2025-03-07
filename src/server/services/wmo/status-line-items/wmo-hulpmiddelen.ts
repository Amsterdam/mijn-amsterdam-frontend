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
    isChecked: (stepIndex, aanvraag, today) =>
      isOpdrachtGegeven(aanvraag, today),
    isActive: (stepIndex, aanvraag, today) =>
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
    isChecked: (stepIndex, aanvraag, today) =>
      isOpdrachtGegeven(aanvraag, today) && isDelivered(aanvraag, today),
    isActive: (stepIndex, aanvraag, today: Date) =>
      isDeliveredStatusActive(aanvraag, today),
    description: (aanvraag, today) =>
      isOpdrachtGegeven(aanvraag, today) && isDelivered(aanvraag, today)
        ? `<p>${aanvraag.leverancier} heeft ons laten weten dat een ${aanvraag.titel} bij u is afgeleverd.</p>`
        : '',
  },
  EINDE_RECHT,
];

/**
 * Er zijn een aantal voorzieninginen in Zorgned gekopieerd naar nieuwe voorzieningen.
 * De oude voorzieningen zijn afgesloten (einde recht).
 * De nieuwe voorzieningen zijn niet voorzien van een besluit document  waardoor de besluit status niet zichtbaar is.
 */
export function getHulpmiddelenDisclaimer(
  detailAanvraag: ZorgnedAanvraagTransformed,
  aanvragen: ZorgnedAanvraagTransformed[]
): string | undefined {
  const datumEindeGeldigheid = '2024-10-31';
  const datumIngangGeldigheid = '2024-11-01';

  const hasNietActueelMatch =
    detailAanvraag.isActueel &&
    detailAanvraag.datumIngangGeldigheid === datumIngangGeldigheid &&
    aanvragen.some(
      (aanvraag) =>
        aanvraag.datumEindeGeldigheid === datumEindeGeldigheid &&
        aanvraag.titel === detailAanvraag.titel &&
        !aanvraag.isActueel
    );

  const hasActueelMatch =
    !detailAanvraag.isActueel &&
    detailAanvraag.datumEindeGeldigheid === datumEindeGeldigheid &&
    aanvragen.some(
      (aanvraag) =>
        aanvraag.datumIngangGeldigheid === datumIngangGeldigheid &&
        aanvraag.titel === detailAanvraag.titel &&
        aanvraag.isActueel
    );

  if (hasNietActueelMatch) {
    return 'Dit hulpmiddel staat per ongeluk ook bij "Eerdere en afgewezen voorzieningen". Daar vindt u het originele besluit met de juiste datums.';
  } else if (hasActueelMatch) {
    return 'Door een fout staat dit hulpmiddel ten onrechte bij Eerdere en afgewezen voorzieningen. Kijk bij "Huidige voorzieningen" of in de brief bovenaan.';
  }

  return undefined;
}
