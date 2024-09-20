import { ZorgnedStatusLineItemTransformerConfig } from '../../zorgned/zorgned-types';

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
    description: (aanvraag) =>
      `<p>${aanvraag.leverancier} heeft ons laten weten dat de/het ${aanvraag.titel} bij u is afgeleverd.</p>
      `,
  },
  EINDE_RECHT,
];
