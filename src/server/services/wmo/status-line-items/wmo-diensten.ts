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
  isDeliveryStepVisible,
  isServiceDeliveryStarted,
  isServiceDeliveryStatusActive,
  isServiceDeliveryStopped,
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
      !isServiceDeliveryStarted(aanvraag, today))
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
      isServiceDeliveryStarted(aanvraag, today),
    isActive: (stepIndex, aanvraag, today: Date) =>
      aanvraag.isActueel && isServiceDeliveryStatusActive(aanvraag, today),
    description: (aanvraag) =>
      `<p> U krijgt nu ${aanvraag.titel} van ${aanvraag.leverancier}.
      </p>
      `,
  },
  {
    status: 'Levering gestopt',
    datePublished: (aanvraag) => aanvraag.datumEindeLevering ?? '',
    isVisible: isDeliveryStepVisible,
    isChecked: (stepIndex, aanvraag, today: Date) =>
      isServiceDeliveryStarted(aanvraag, today) &&
      (isServiceDeliveryStopped(aanvraag, today) ||
        isBeforeToday(aanvraag.datumEindeGeldigheid, today)),
    isActive: (stepIndex, aanvraag, today) =>
      aanvraag.isActueel &&
      isServiceDeliveryStopped(aanvraag, today) &&
      !aanvraag.datumEindeGeldigheid,
    description: (aanvraag) =>
      `<p>
            ${
              aanvraag.isActueel
                ? 'Niet van toepassing.'
                : `${aanvraag.leverancier} heeft ons laten weten dat u geen ${aanvraag.titel} meer krijgt.`
            }
      </p>`,
  },
  EINDE_RECHT,
];
