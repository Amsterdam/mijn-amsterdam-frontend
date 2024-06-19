import { defaultDateFormat } from '../../../../universal/helpers';
import { ZorgnedStatusLineItemTransformerConfig } from '../../zorgned/zorgned-config-and-types';

export const PCVERGOEDING: ZorgnedStatusLineItemTransformerConfig[] = [
  {
    status: 'Besluit',
    datePublished: (data) => data.datumBesluit,
    isChecked: (stepIndex, data) => true,
    isActive: (stepIndex, data) => data.isActueel === true,
    description: (regeling) =>
      `<p>
        ${
          regeling.resultaat === 'toegewezen'
            ? `U heeft recht op een ${regeling.titel} per ${defaultDateFormat(regeling.datumIngangGeldigheid)}`
            : `U heeft geen recht op een ${regeling.titel}`
        }.
        </p>
        <p>
          In de brief leest u ook hoe u bezwaar kunt maken of een klacht kan
          indienen.
        </p>
      `,
  },
  {
    status: 'Voorwaarde vooldaan',
    isVisible: (i, regeling) => regeling.resultaat === 'toegewezen',
    datePublished: (data) => data.datumBesluit,
    isChecked: (stepIndex, data) => true,
    isActive: (stepIndex, data) => data.isActueel === true,
    description: (data) =>
      `
        <p>
          Uw heeft voldaan aan de voorwaarde voor het recht op ${data.titel} per ${defaultDateFormat(
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
    status: 'Einde recht',
    isVisible: (i, regeling) => regeling.resultaat === 'toegewezen',
    datePublished: (data) =>
      (data.isActueel ? '' : data.datumEindeGeldigheid) || '',
    isChecked: () => false,
    isActive: (stepIndex, data) => data.isActueel === false,
    description: (data) =>
      `
        <p>
          ${
            data.isActueel
              ? 'Op het moment dat uw recht stopt, ontvangt u hiervan bericht.'
              : `Uw recht op ${data.titel} is beëindigd ${
                  data.datumEindeGeldigheid
                    ? `per ${defaultDateFormat(data.datumEindeGeldigheid)}`
                    : ''
                }`
          }
        </p>
      `,
  },
];
