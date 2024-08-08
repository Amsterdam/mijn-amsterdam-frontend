import { ZorgnedStatusLineItemTransformerConfig } from '../../zorgned/zorgned-config-and-types';

import {
  AANVRAAG,
  EINDE_RECHT,
  getTransformerConfigBesluit,
  IN_BEHANDELING,
  isBeforeToday,
  isDecisionWithDeliveryActive,
  isServiceDeliveryActive,
  isServiceDeliveryStarted,
  MEER_INFORMATIE,
} from './wmo-generic';

export const hulpmiddelen: ZorgnedStatusLineItemTransformerConfig[] = [
  AANVRAAG,
  IN_BEHANDELING,
  MEER_INFORMATIE,
  getTransformerConfigBesluit(isDecisionWithDeliveryActive, true),
  {
    status: 'Opdracht gegeven',
    datePublished: (aanvraag) => aanvraag.datumOpdrachtLevering ?? '',
    isVisible: (stepIndex, aanvraag, today, allAanvragen) => {
      return aanvraag.resultaat !== 'afgewezen';
    },
    isChecked: (stepIndex, aanvraag, today: Date) =>
      isBeforeToday(aanvraag.datumOpdrachtLevering, today),
    isActive: (stepIndex, aanvraag, today) =>
      aanvraag.isActueel &&
      isBeforeToday(aanvraag.datumOpdrachtLevering, today) &&
      !isServiceDeliveryStarted(aanvraag, today),
    description: (aanvraag) =>
      `<p>
        Wij hebben ${aanvraag.leverancier} gevraagd om een ${aanvraag.titel} aan u te leveren.
      </p>`,
  },
  {
    status: 'Product geleverd',
    datePublished: (aanvraag) => aanvraag.datumBeginLevering ?? '',

    isChecked: (stepIndex, aanvraag, today) =>
      isServiceDeliveryStarted(aanvraag, today),
    isActive: (stepIndex, aanvraag, today: Date) =>
      isServiceDeliveryActive(aanvraag, today),
    description: (aanvraag) =>
      `<p>
        ${aanvraag.leverancier} heeft ons laten weten dat de/het ${aanvraag.titel} bij u is afgeleverd.
      </p>
      `,
    isVisible: (stepIndex, aanvraag, today, allAanvragen) => {
      return aanvraag.resultaat !== 'afgewezen';
    },
  },
  EINDE_RECHT,
];
