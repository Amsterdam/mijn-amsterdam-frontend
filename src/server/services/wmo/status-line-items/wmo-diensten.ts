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
  isDecisionActive,
  isServiceDeliveryActive,
  isServiceDeliveryStarted,
  isServiceDeliveryStopped,
  MEER_INFORMATIE,
} from './wmo-generic';

function isActive(
  stepIndex: number,
  aanvraag: ZorgnedAanvraagTransformed,
  today: Date
) {
  return (
    isDecisionActive(stepIndex, aanvraag) &&
    !isServiceDeliveryStarted(aanvraag, today)
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
      return aanvraag.resultaat !== 'afgewezen';
    },
    isChecked: (stepIndex, aanvraag, today: Date) =>
      isServiceDeliveryStarted(aanvraag, today),
    isActive: (stepIndex, aanvraag, today: Date) =>
      aanvraag.isActueel && isServiceDeliveryActive(aanvraag, today),
    description: (aanvraag) =>
      `<p>
        ${aanvraag.leverancier} is gestart met het leveren van ${aanvraag.titel}.
      </p>
      `,
  },
  {
    status: 'Levering gestopt',
    datePublished: (aanvraag) => aanvraag.datumEindeLevering ?? '',
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
                : `${aanvraag.leverancier} heeft aan ons doorgegeven dat u geen ${aanvraag.titel}
        meer krijgt.`
            }
      </p>`,
    isVisible: (stepIndex, aanvraag, today, allAanvragen) => {
      return aanvraag.resultaat !== 'afgewezen';
    },
  },
  EINDE_RECHT,
];
