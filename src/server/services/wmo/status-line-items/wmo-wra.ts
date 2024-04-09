import { defaultDateFormat } from '../../../../universal/helpers';
import { WMOStatusLineItemFormatterConfig } from '../wmo-config-and-types';
import {
  hasHistoricDate,
  isServiceDeliveryStarted,
  isServiceDeliveryActive,
} from './wmo-helpers';

export const WRA: WMOStatusLineItemFormatterConfig[] = [
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
            De gemeente heeft opdracht gegeven aan ${data.leverancier} om de aanpassingen aan uw woning uit
            te voeren.
          </p>`,
  },
  {
    status: 'Aanpassing uitgevoerd',
    datePublished: () => '',
    isChecked: (stepIndex, sourceData, today) =>
      isServiceDeliveryStarted(sourceData, today),
    isActive: (stepIndex, sourceData, today) =>
      isServiceDeliveryActive(sourceData, today),
    isVisible: (stepIndex, sourceData, today) => {
      return !!sourceData.datumBeginLevering || sourceData.isActueel;
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
    isChecked: (stepIndex, sourceData) => sourceData.isActueel === false,
    isActive: (stepIndex, sourceData, today) => sourceData.isActueel === false,
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
