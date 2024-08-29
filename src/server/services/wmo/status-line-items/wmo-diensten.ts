import {
  ZorgnedAanvraagTransformed,
  ZorgnedStatusLineItemTransformerConfig,
} from '../../zorgned/zorgned-config-and-types';

import {
  AANVRAAG,
  EINDE_RECHT,
  getTransformerConfigBesluit,
  IN_BEHANDELING,
  isBeforeToday,
  isDecisionStatusActive,
  isServiceDeliveryStatusActive,
  isServiceDeliveryStarted,
  isServiceDeliveryStopped,
  MEER_INFORMATIE,
  hasDecision,
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
    isVisible: (stepIndex, aanvraag, today, allAanvragen) => {
      return hasDecision(aanvraag) && aanvraag.resultaat !== 'afgewezen';
    },
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
    isVisible: (stepIndex, aanvraag, today, allAanvragen) => {
      return hasDecision(aanvraag) && aanvraag.resultaat !== 'afgewezen';
    },
    isChecked: (stepIndex, aanvraag, today: Date) =>
      isServiceDeliveryStopped(aanvraag, today) ||
      isBeforeToday(aanvraag.datumEindeGeldigheid, today),
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
