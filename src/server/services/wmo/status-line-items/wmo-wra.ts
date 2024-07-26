import { defaultDateFormat } from '../../../../universal/helpers/date';
import { ZorgnedStatusLineItemTransformerConfig } from '../../zorgned/zorgned-config-and-types';

import {
  hasHistoricDate,
  isServiceDeliveryStarted,
  isServiceDeliveryActive,
} from '../../zorgned/zorgned-helpers';
import { AANVRAAG, IN_BEHANDELING, MEER_INFORMATIE } from './wmo-generic';

export const WRA: ZorgnedStatusLineItemTransformerConfig[] = [
  AANVRAAG,
  IN_BEHANDELING,
  MEER_INFORMATIE,
  {
    status: 'Besluit',
    datePublished: (aanvraag) => aanvraag.datumBesluit,
    isChecked: (stepIndex, aanvraag) => !!aanvraag.datumBesluit,
    isActive: (stepIndex, aanvraag, today) =>
      !!aanvraag.datumBesluit &&
      !hasHistoricDate(aanvraag.datumOpdrachtLevering, today) &&
      !isServiceDeliveryStarted(aanvraag, today),
    description: (data) =>
      `
            <p>
              U heeft recht op een ${data.titel} per ${
                data.datumIngangGeldigheid
                  ? defaultDateFormat(data.datumIngangGeldigheid)
                  : ''
              }.
            </p>
            <p>
              In de brief leest u ook hoe u bezwaar kunt maken of een klacht kan
              indienen.
            </p>
          `,
  },
  {
    status: 'Opdracht gegeven',
    datePublished: () => '',
    isChecked: (stepIndex, aanvraag, today: Date) =>
      hasHistoricDate(aanvraag.datumOpdrachtLevering, today),
    isActive: (stepIndex, aanvraag, today) =>
      aanvraag.isActueel &&
      hasHistoricDate(aanvraag.datumOpdrachtLevering, today) &&
      !isServiceDeliveryStarted(aanvraag, today),
    description: (data) =>
      `<p>
            De gemeente heeft opdracht gegeven aan ${data.leverancier} om de aanpassingen aan uw woning uit
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
    description: (data) =>
      `<p>
            ${data.leverancier} heeft aan ons doorgegeven dat de
            aanpassing aan uw woning is uitgevoerd.
          </p>`,
  },
  {
    status: 'Einde recht',
    datePublished: (data) =>
      (data.isActueel ? '' : data.datumEindeGeldigheid) || '',
    isChecked: (stepIndex, aanvraag) => aanvraag.isActueel === false,
    isActive: (stepIndex, aanvraag, today) => aanvraag.isActueel === false,
    description: (data) =>
      `<p>
            ${
              data.isActueel
                ? 'Op het moment dat uw recht stopt, ontvangt u hiervan bericht.'
                : `Uw recht op ${data.titel} is beëindigd ${
                    data.datumEindeGeldigheid
                      ? `per ${defaultDateFormat(data.datumEindeGeldigheid)}`
                      : ''
                  }`
            }
          </p>`,
  },
];
