import {
  ZorgnedAanvraagTransformed,
  ZorgnedStatusLineItemTransformerConfig,
} from '../../zorgned/zorgned-types';
import {
  AANVRAAG,
  EINDE_RECHT,
  getTransformerConfigBesluit,
  IN_BEHANDELING,
  isBeforeToday,
  isDecisionStatusActive,
  isDelivered,
  isDeliveredStatusActive,
  isDeliveryStepVisible,
  isDeliveryStopped,
  MEER_INFORMATIE,
} from './wmo-generic';

function isActive(
  stepIndex: number,
  aanvraag: ZorgnedAanvraagTransformed,
  today: Date
) {
  return (
    aanvraag.resultaat === 'afgewezen' ||
    (isDecisionStatusActive(stepIndex, aanvraag) &&
      !isDelivered(aanvraag, today))
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
    isChecked: (stepIndex, aanvraag, today: Date) =>
      isDelivered(aanvraag, today),
    isActive: (stepIndex, aanvraag, today: Date) =>
      aanvraag.isActueel && isDeliveredStatusActive(aanvraag, today),
    description: (aanvraag) =>
      `<p>U krijgt nu ${aanvraag.titel} van ${aanvraag.leverancier}.</p>`,
  },
  {
    status: 'Levering gestopt',
    datePublished: (aanvraag) => aanvraag.datumEindeLevering ?? '',
    isVisible: isDeliveryStepVisible,
    isChecked: (stepIndex, aanvraag, today: Date) =>
      isDelivered(aanvraag, today) &&
      (isDeliveryStopped(aanvraag, today) ||
        isBeforeToday(aanvraag.datumEindeGeldigheid, today)),
    isActive: (stepIndex, aanvraag, today) =>
      isDeliveryStopped(aanvraag, today) &&
      !isBeforeToday(aanvraag.datumEindeGeldigheid, today),
    description: (aanvraag) =>
      `<p>${`${aanvraag.leverancier} heeft ons laten weten dat u geen ${aanvraag.titel} meer krijgt.`}</p>`,
  },
  EINDE_RECHT,
];
