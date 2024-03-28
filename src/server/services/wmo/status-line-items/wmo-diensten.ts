import { defaultDateFormat } from '../../../../universal/helpers';
import { WMOStatusLineItemFormatterConfig } from '../wmo-config-and-types';
import {
  hasFutureDate,
  hasHistoricDate,
  isServiceDeliveryActive,
  isServiceDeliveryStarted,
  isServiceDeliveryStopped,
} from './wmo-helpers';

export const diensten: WMOStatusLineItemFormatterConfig[] = [
  {
    status: 'Besluit',
    datePublished: (data) => data.datumBesluit,
    isChecked: () => true,
    isActive: (stepIndex, sourceData, today) =>
      !isServiceDeliveryStarted(sourceData, today),
    description: (data) => {
      return `
              <p>
                U hebt recht op ${data.titel} per ${defaultDateFormat(
                  data.datumIngangGeldigheid
                )}.
              </p>
              <p>
                ${
                  data.isActueel &&
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
                  ].includes(data.productsoortCode)
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
    isChecked: (stepIndex, sourceData, today: Date) =>
      isServiceDeliveryStarted(sourceData, today),
    isActive: (stepIndex, sourceData, today: Date) =>
      sourceData.isActueel && isServiceDeliveryActive(sourceData, today),
    description: (data) =>
      `<p>
            ${data.leverancier} is gestart met het leveren van ${data.titel}.
          </p>`,
  },
  {
    status: 'Levering gestopt',
    datePublished: () => '',
    isChecked: (stepIndex, sourceData, today: Date) =>
      isServiceDeliveryStopped(sourceData, today) ||
      hasHistoricDate(sourceData.datumEindeGeldigheid, today),
    isActive: (stepIndex, sourceData, today) =>
      sourceData.isActueel &&
      isServiceDeliveryStopped(sourceData, today) &&
      !sourceData.datumEindeGeldigheid,
    description: (data) =>
      `<p>
            ${
              data.isActueel
                ? 'Niet van toepassing.'
                : `${data.leverancier} heeft aan ons doorgegeven dat u geen ${data.titel}
            meer krijgt.`
            }
          </p>`,
    isVisible: (stepIndex, sourceData, today) => {
      return !!sourceData.datumBeginLevering || sourceData.isActueel;
    },
  },
  {
    status: 'Einde recht',
    datePublished: (data, today) =>
      (hasFutureDate(data.datumEindeGeldigheid, today)
        ? ''
        : data.datumEindeGeldigheid) || '',
    isChecked: (stepIndex, sourceData, today) =>
      hasHistoricDate(sourceData.datumEindeGeldigheid, today),
    isActive: (stepIndex, sourceData, today) =>
      hasHistoricDate(sourceData.datumEindeGeldigheid, today),
    description: (sourceData, today) =>
      `<p>
            ${
              hasFutureDate(sourceData.datumEindeGeldigheid, today)
                ? 'Op het moment dat uw recht stopt, ontvangt u hiervan bericht.'
                : `Uw recht op ${sourceData.titel} is beëindigd ${
                    sourceData.datumEindeGeldigheid
                      ? `per ${defaultDateFormat(
                          sourceData.datumEindeGeldigheid
                        )}`
                      : ''
                  }`
            }
          </p>`,
  },
];
