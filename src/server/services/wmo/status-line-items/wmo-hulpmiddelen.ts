import { ZorgnedStatusLineItemTransformerConfig } from '../../zorgned/zorgned-types';

import {
  AANVRAAG,
  EINDE_RECHT,
  getTransformerConfigBesluit,
  IN_BEHANDELING,
  isBeforeToday,
  isDecisionWithDeliveryStatusActive,
  isDeliveryStepVisible,
  isServiceDeliveryStarted,
  isServiceDeliveryStatusActive,
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
    isVisible: isDeliveryStepVisible,
    isChecked: (stepIndex, aanvraag, today: Date) =>
      isBeforeToday(aanvraag.datumOpdrachtLevering, today),
    isActive: (stepIndex, aanvraag, today) =>
      aanvraag.isActueel &&
      isBeforeToday(aanvraag.datumOpdrachtLevering, today) &&
      !isServiceDeliveryStarted(aanvraag, today),
    description: (aanvraag, today) =>
      isBeforeToday(aanvraag.datumOpdrachtLevering, today)
        ? `<p>Wij hebben ${aanvraag.leverancier} gevraagd om een ${aanvraag.titel} aan u te leveren.</p>`
        : '',
  },
  {
    status: 'Product geleverd',
    datePublished: (aanvraag) => aanvraag.datumBeginLevering ?? '',
    isVisible: isDeliveryStepVisible,
    isChecked: (stepIndex, aanvraag, today) =>
      isServiceDeliveryStarted(aanvraag, today),
    isActive: (stepIndex, aanvraag, today: Date) =>
      isServiceDeliveryStatusActive(aanvraag, today),
    description: (aanvraag, today) =>
      isServiceDeliveryStarted(aanvraag, today)
        ? `<p>${aanvraag.leverancier} heeft ons laten weten dat de/het ${aanvraag.titel} bij u is afgeleverd.</p>`
        : '',
  },
  EINDE_RECHT,
];
