import { defaultDateFormat } from '../../../../universal/helpers/date';
import { ZorgnedStatusLineItemTransformerConfig } from '../../zorgned/zorgned-config-and-types';

import {
  hasHistoricDate,
  isServiceDeliveryActive,
  isServiceDeliveryStarted,
} from '../../zorgned/zorgned-helpers';
import { AANVRAAG, IN_BEHANDELING, MEER_INFORMATIE } from './wmo-generic';

export const hulpmiddelen: ZorgnedStatusLineItemTransformerConfig[] = [
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
    description: (aanvraag) =>
      `
            <p>
              U heeft recht op een ${aanvraag.titel} per ${
                aanvraag.datumIngangGeldigheid
                  ? defaultDateFormat(aanvraag.datumIngangGeldigheid)
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
          </p>`,
    isVisible: (stepIndex, aanvraag, today) => {
      return !!aanvraag.datumBeginLevering || aanvraag.isActueel;
    },
  },
  {
    status: 'Einde recht',
    datePublished: (aanvraag) =>
      (aanvraag.isActueel ? '' : aanvraag.datumEindeGeldigheid) || '',
    isChecked: (stepIndex, aanvraag) => aanvraag.isActueel === false,
    isActive: (stepIndex, aanvraag) => aanvraag.isActueel === false,
    description: (aanvraag) =>
      `<p>
            ${
              aanvraag.isActueel
                ? 'Op het moment dat uw recht stopt, ontvangt u hiervan bericht.'
                : `Uw recht op ${aanvraag.titel} is beëindigd${
                    aanvraag.datumEindeGeldigheid
                      ? ` per ${defaultDateFormat(aanvraag.datumEindeGeldigheid)}`
                      : ''
                  }.`
            }
          </p>`,
  },
];
