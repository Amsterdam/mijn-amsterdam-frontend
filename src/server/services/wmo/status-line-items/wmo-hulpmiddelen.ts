import { defaultDateFormat } from '../../../../universal/helpers';
import { WMOStatusLineItemFormatterConfig } from '../wmo-config-and-types';
import {
  hasHistoricDate,
  isServiceDeliveryStarted,
  isServiceDeliveryActive,
} from './wmo-helpers';

export const hulpmiddelen: WMOStatusLineItemFormatterConfig[] = [
  {
    status: 'Besluit',
    datePublished: (data) => data.datumBesluit,
    isChecked: () => true,
    isActive: (stepIndex, sourceData, today) =>
      !hasHistoricDate(sourceData.datumOpdrachtLevering, today) &&
      !isServiceDeliveryStarted(sourceData, today),
    description: (data) =>
      `
            <p>
              U hebt recht op een ${data.titel} per ${defaultDateFormat(
                data.datumIngangGeldigheid
              )}.
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
    isChecked: (stepIndex, sourceData, today: Date) =>
      hasHistoricDate(sourceData.datumOpdrachtLevering, today),
    isActive: (stepIndex, sourceData, today) =>
      sourceData.isActueel &&
      hasHistoricDate(sourceData.datumOpdrachtLevering, today) &&
      !isServiceDeliveryStarted(sourceData, today),
    description: (data) =>
      `<p>
            De gemeente heeft opdracht gegeven aan ${data.leverancier} om een ${data.titel} aan u te leveren.
          </p>`,
  },
  {
    status: 'Product geleverd',
    datePublished: () => '',
    isChecked: (stepIndex, sourceData, today) =>
      isServiceDeliveryStarted(sourceData, today),
    isActive: (stepIndex, sourceData, today: Date) =>
      isServiceDeliveryActive(sourceData, today),
    description: (data) =>
      `<p>
            ${data.leverancier} heeft aan ons doorgegeven dat een ${data.titel} bij u is afgeleverd.
          </p>`,
    isVisible: (stepIndex, sourceData, today) => {
      return !!sourceData.datumBeginLevering || sourceData.isActueel;
    },
  },
  {
    status: 'Einde recht',
    datePublished: (data) =>
      (data.isActueel ? '' : data.datumEindeGeldigheid) || '',
    isChecked: (stepIndex, sourceData) => sourceData.isActueel === false,
    isActive: (stepIndex, sourceData) => sourceData.isActueel === false,
    description: (data) =>
      `<p>
            ${
              data.isActueel
                ? 'Op het moment dat uw recht stopt, ontvangt u hiervan bericht.'
                : `Uw recht op ${data.titel} is beëindigd${
                    data.datumEindeGeldigheid
                      ? ` per ${defaultDateFormat(data.datumEindeGeldigheid)}`
                      : ''
                  }.`
            }
          </p>`,
  },
];
