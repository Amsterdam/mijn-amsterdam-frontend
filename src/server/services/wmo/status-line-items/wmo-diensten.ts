import { defaultDateFormat } from '../../../../universal/helpers/date';
import { ZorgnedStatusLineItemTransformerConfig } from '../../zorgned/zorgned-config-and-types';

import {
  hasFutureDate,
  hasHistoricDate,
  isServiceDeliveryActive,
  isServiceDeliveryStarted,
  isServiceDeliveryStopped,
} from '../../zorgned/zorgned-helpers';
import { AANVRAAG, IN_BEHANDELING, MEER_INFORMATIE } from './wmo-generic';

export const diensten: ZorgnedStatusLineItemTransformerConfig[] = [
  AANVRAAG,
  IN_BEHANDELING,
  MEER_INFORMATIE,
  {
    status: 'Besluit',
    datePublished: (aanvraag) => aanvraag.datumBesluit,
    isChecked: (stepIndex, aanvraag) => !!aanvraag.datumBesluit,
    isActive: (stepIndex, aanvraag, today) =>
      !!aanvraag.datumBesluit && !isServiceDeliveryStarted(aanvraag, today),
    description: (aanvraag) => {
      return `
              <p>
                U heeft recht op ${aanvraag.titel} per ${
                  aanvraag.datumIngangGeldigheid
                    ? defaultDateFormat(aanvraag.datumIngangGeldigheid)
                    : ''
                }.
              </p>
              <p>
                ${
                  aanvraag.isActueel &&
                  [
                    'AWBG',
                    'WMH',
                    'AO1',
                    'AO2',
                    'AO3',
                    'AO4',
                    'AO5',
                    'AO6',
                    'AO7',
                    'AO8',
                    'DBA',
                    'DBH',
                    'DBL',
                    'DBS',
                    'KVB',
                  ].includes(aanvraag.productsoortCode)
                    ? `
                    In de brief leest u ook hoe u bezwaar kunt maken, een klacht
                    kan indienen of <u>hoe u van aanbieder kunt wisselen.</u>
                  `
                    : `In de brief leest u ook hoe u bezwaar kunt maken of een klacht kan
              indienen.`
                }
              </p>
            `;
    },
  },
  {
    status: 'Levering gestart',
    datePublished: () => '',
    isChecked: (stepIndex, aanvraag, today: Date) =>
      isServiceDeliveryStarted(aanvraag, today),
    isActive: (stepIndex, aanvraag, today: Date) =>
      aanvraag.isActueel && isServiceDeliveryActive(aanvraag, today),
    description: (aanvraag) =>
      `<p>
            ${aanvraag.leverancier} is gestart met het leveren van ${aanvraag.titel}.
          </p>`,
  },
  {
    status: 'Levering gestopt',
    datePublished: () => '',
    isChecked: (stepIndex, aanvraag, today: Date) =>
      isServiceDeliveryStopped(aanvraag, today) ||
      hasHistoricDate(aanvraag.datumEindeGeldigheid, today),
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
    isVisible: (stepIndex, aanvraag, today) => {
      return !!aanvraag.datumBeginLevering || aanvraag.isActueel;
    },
  },
  {
    status: 'Einde recht',
    datePublished: (aanvraag, today) =>
      (hasFutureDate(aanvraag.datumEindeGeldigheid, today)
        ? ''
        : aanvraag.datumEindeGeldigheid) || '',
    isChecked: (stepIndex, aanvraag, today) =>
      hasHistoricDate(aanvraag.datumEindeGeldigheid, today),
    isActive: (stepIndex, aanvraag, today) =>
      hasHistoricDate(aanvraag.datumEindeGeldigheid, today),
    description: (aanvraag, today) =>
      `<p>
            ${
              hasFutureDate(aanvraag.datumEindeGeldigheid, today)
                ? 'Op het moment dat uw recht stopt, ontvangt u hiervan bericht.'
                : `Uw recht op ${aanvraag.titel} is beëindigd ${
                    aanvraag.datumEindeGeldigheid
                      ? `per ${defaultDateFormat(
                          aanvraag.datumEindeGeldigheid
                        )}`
                      : ''
                  }`
            }
          </p>`,
  },
];
