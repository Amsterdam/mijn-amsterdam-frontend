import { defaultDateFormat } from '../../../../universal/helpers/date';
import { ZorgnedStatusLineItemTransformerConfig } from '../../zorgned/zorgned-config-and-types';

import {
  isBeforeToday,
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

export const WRA: ZorgnedStatusLineItemTransformerConfig[] = [
  AANVRAAG,
  IN_BEHANDELING,
  MEER_INFORMATIE,
  getTransformerConfigBesluit(isServiceDeliveryDecisionActive, true),
  {
    status: 'Opdracht gegeven',
    datePublished: () => '',
    isChecked: (stepIndex, aanvraag, today: Date) =>
      isBeforeToday(aanvraag.datumOpdrachtLevering, today),
    isActive: (stepIndex, aanvraag, today) =>
      aanvraag.isActueel &&
      isBeforeToday(aanvraag.datumOpdrachtLevering, today) &&
      !isServiceDeliveryStarted(aanvraag, today),
    description: (aanvraag) =>
      `<p>
        De gemeente heeft opdracht gegeven aan ${aanvraag.leverancier} om de aanpassingen aan uw woning uit
        te voeren.
      </p>`,
  },
  {
    status: 'Aanpassing uitgevoerd',
    datePublished: () => '',
    isChecked: (stepIndex, aanvraag, today) =>
      isServiceDeliveryStarted(aanvraag, today),
    isActive: (stepIndex, aanvraag, today) =>
      isServiceDeliveryActive(aanvraag, today),
    isVisible: (stepIndex, aanvraag, today) => {
      return !!aanvraag.datumBeginLevering || aanvraag.isActueel;
    },
    description: (aanvraag) =>
      `<p>
        ${aanvraag.leverancier} heeft aan ons doorgegeven dat de
        aanpassing aan uw woning is uitgevoerd.
      </p>`,
  },
  EINDE_RECHT,
];
