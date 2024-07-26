import { defaultDateFormat } from '../../../../universal/helpers/date';
import { ZorgnedStatusLineItemTransformerConfig } from '../../zorgned/zorgned-config-and-types';

export const REGELING: ZorgnedStatusLineItemTransformerConfig[] = [
  {
    status: 'Besluit',
    datePublished: (regeling) => regeling.datumBesluit,
    isChecked: (stepIndex, regeling) => true,
    isActive: (stepIndex, regeling) =>
      regeling.isActueel === true || regeling.resultaat === 'afgewezen',
    description: (regeling) =>
      `<p>
        ${
          regeling.resultaat === 'toegewezen'
            ? `U heeft recht op ${regeling.titel} per ${regeling.datumIngangGeldigheid ? defaultDateFormat(regeling.datumIngangGeldigheid) : ''}`
            : `U heeft geen recht op ${regeling.titel}`
        }.
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
    datePublished: (regeling) =>
      (regeling.isActueel ? '' : regeling.datumEindeGeldigheid) || '',
    isChecked: () => false,
    isActive: (stepIndex, regeling) => regeling.isActueel === false,
    description: (regeling) =>
      `
        <p>
          ${
            regeling.isActueel
              ? 'Op het moment dat uw recht stopt, ontvangt u hiervan bericht.'
              : `Uw recht op ${regeling.titel} is beëindigd ${
                  regeling.datumEindeGeldigheid
                    ? `per ${defaultDateFormat(regeling.datumEindeGeldigheid)}`
                    : ''
                }`
          }
        </p>
      `,
  },
];
