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

export const WRA: ZorgnedStatusLineItemTransformerConfig[] = [
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
    description: (aanvraag) =>
      `<p>
       We hebben ${aanvraag.leverancier} gevraagd om de aanpassing(en) aan uw woning uit te voeren.
      </p>`,
  },
  {
    status: 'Aanpassing uitgevoerd',
    datePublished: (aanvraag) => aanvraag.datumBeginLevering ?? '',
    isVisible: isDeliveryStepVisible,
    isChecked: (stepIndex, aanvraag, today) =>
      isServiceDeliveryStarted(aanvraag, today),
    isActive: (stepIndex, aanvraag, today) =>
      isServiceDeliveryStatusActive(aanvraag, today),
    description: (aanvraag) =>
      `<p>
        ${aanvraag.leverancier} heeft ons laten weten dat de aanpassing(en) aan uw woning klaar is/zijn.
      </p>`,
  },
  EINDE_RECHT,
];
