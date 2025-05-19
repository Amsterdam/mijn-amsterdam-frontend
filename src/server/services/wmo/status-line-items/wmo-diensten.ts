import {
  AANVRAAG,
  EINDE_RECHT,
  getTransformerConfigBesluit,
  IN_BEHANDELING,
  isDecisionStatusActive,
  isDelivered,
  isDeliveredStatusActive,
  isDeliveryStepVisible,
  isDeliveryStopped,
  isEindeGeldigheidVerstreken,
  MEER_INFORMATIE,
} from './wmo-generic';
import {
  ZorgnedAanvraagTransformed,
  ZorgnedStatusLineItemTransformerConfig,
} from '../../zorgned/zorgned-types';

function isActive(aanvraag: ZorgnedAanvraagTransformed, today: Date) {
  return (
    aanvraag.resultaat === 'afgewezen' ||
    (isDecisionStatusActive(aanvraag) && !isDelivered(aanvraag, today))
  );
}

function isLeveringGestopt(aanvraag: ZorgnedAanvraagTransformed, today: Date) {
  return (
    isDelivered(aanvraag, today) &&
    (isDeliveryStopped(aanvraag, today) ||
      isEindeGeldigheidVerstreken(aanvraag.datumEindeGeldigheid, today))
  );
}

export const diensten: ZorgnedStatusLineItemTransformerConfig[] = [
  AANVRAAG,
  IN_BEHANDELING,
  MEER_INFORMATIE,
  getTransformerConfigBesluit(isActive, false),
  {
    status: 'Levering gestart',
    datePublished: (aanvraag) => aanvraag.datumBeginLevering ?? '',
    isVisible: isDeliveryStepVisible,
    isChecked: (aanvraag, today: Date) => isDelivered(aanvraag, today),
    isActive: (aanvraag, today: Date) =>
      aanvraag.isActueel && isDeliveredStatusActive(aanvraag, today),
    description: (aanvraag, today) =>
      isDelivered(aanvraag, today)
        ? `<p>U krijgt nu ${aanvraag.titel} van ${aanvraag.leverancier}.</p>`
        : '',
  },
  {
    status: 'Levering gestopt',
    datePublished: (aanvraag) => aanvraag.datumEindeLevering ?? '',
    isVisible: isDeliveryStepVisible,
    isChecked: isLeveringGestopt,
    isActive: (aanvraag, today) =>
      isDeliveryStopped(aanvraag, today) &&
      !isEindeGeldigheidVerstreken(aanvraag.datumEindeGeldigheid, today),
    description: (aanvraag, today) =>
      isLeveringGestopt(aanvraag, today)
        ? `<p>${`${aanvraag.leverancier} heeft ons laten weten dat u geen ${aanvraag.titel} meer krijgt.`}</p>`
        : '',
  },
  EINDE_RECHT,
];
