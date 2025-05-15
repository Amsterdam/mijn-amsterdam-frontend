import {
  AANVRAAG,
  EINDE_RECHT,
  getTransformerConfigBesluit,
  IN_BEHANDELING,
  isDecisionWithDeliveryStatusActive,
  isDelivered,
  isDeliveredStatusActive,
  isDeliveryStepVisible,
  isOpdrachtGegeven,
  isOpdrachtGegevenVisible,
  MEER_INFORMATIE,
} from './wmo-generic';
import { ZorgnedStatusLineItemTransformerConfig } from '../../zorgned/zorgned-types';

export const WRA: ZorgnedStatusLineItemTransformerConfig[] = [
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
    description: (aanvraag, today) =>
      isOpdrachtGegeven(aanvraag, today)
        ? `<p>We hebben ${aanvraag.leverancier} gevraagd om de aanpassing(en) aan uw woning uit te voeren.</p>`
        : '',
  },
  {
    status: 'Aanpassing uitgevoerd',
    datePublished: (aanvraag) => aanvraag.datumBeginLevering ?? '',
    isVisible: isDeliveryStepVisible,
    isChecked: (aanvraag, today) =>
      isOpdrachtGegeven(aanvraag, today) && isDelivered(aanvraag, today),
    isActive: (aanvraag, today) => isDeliveredStatusActive(aanvraag, today),
    description: (aanvraag, today) =>
      isOpdrachtGegeven(aanvraag, today) && isDelivered(aanvraag, today)
        ? `<p>${aanvraag.leverancier} heeft ons laten weten dat de aanpassing(en) aan uw woning klaar is/zijn.</p>`
        : '',
  },
  EINDE_RECHT,
];
