import { ZorgnedStatusLineItemTransformerConfig } from '../../zorgned/zorgned-config-and-types';

import {
  isHistoricDate,
  isServiceDeliveryActive,
  isServiceDeliveryStarted,
} from '../../zorgned/zorgned-helpers';
import {
  AANVRAAG,
  EINDE_RECHT,
  getTransformerConfigBesluit,
  IN_BEHANDELING,
  isServiceDeliveryDecisionActive,
  MEER_INFORMATIE,
} from './wmo-generic';

export const hulpmiddelen: ZorgnedStatusLineItemTransformerConfig[] = [
  AANVRAAG,
  IN_BEHANDELING,
  MEER_INFORMATIE,
  getTransformerConfigBesluit(isServiceDeliveryDecisionActive, true),
  {
    status: 'Opdracht gegeven',
    datePublished: () => '',
    isChecked: (stepIndex, aanvraag, today: Date) =>
      isHistoricDate(aanvraag.datumOpdrachtLevering, today),
    isActive: (stepIndex, aanvraag, today) =>
      aanvraag.isActueel &&
      isHistoricDate(aanvraag.datumOpdrachtLevering, today) &&
      !isServiceDeliveryStarted(aanvraag, today),
    description: (aanvraag) =>
      `<p>
        De gemeente heeft opdracht gegeven aan ${aanvraag.leverancier} om een ${aanvraag.titel} aan u te leveren.
      </p>`,
  },
  {
    status: 'Product geleverd',
    datePublished: () => '',
    isChecked: (stepIndex, aanvraag, today) =>
      isServiceDeliveryStarted(aanvraag, today),
    isActive: (stepIndex, aanvraag, today: Date) =>
      isServiceDeliveryActive(aanvraag, today),
    description: (aanvraag) =>
      `<p>
        ${aanvraag.leverancier} heeft aan ons doorgegeven dat een ${aanvraag.titel} bij u is afgeleverd.
      </p>
      `,
    isVisible: (stepIndex, aanvraag, today) => {
      return !!aanvraag.datumBeginLevering || aanvraag.isActueel;
    },
  },
  EINDE_RECHT,
];
