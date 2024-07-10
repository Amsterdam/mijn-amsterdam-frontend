import { defaultDateFormat } from '../../../../universal/helpers/date';
import { ZorgnedStatusLineItemTransformerConfig } from '../../zorgned/zorgned-config-and-types';

export const REGELING_PERIODIEK: ZorgnedStatusLineItemTransformerConfig[] = [
  {
    status: 'Besluit',
    datePublished: (data) => data.datumBesluit,
    isChecked: (stepIndex, data) => true,
    isActive: (stepIndex, data) => data.isActueel === true,
    description: (regeling) =>
      `<p>
        ${
          regeling.resultaat === 'toegewezen'
            ? `U heeft recht op ${regeling.titel} per ${defaultDateFormat(regeling.datumIngangGeldigheid)}`
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
    datePublished: (data) => data.datumEindeGeldigheid,
    isChecked: () => false,
    isActive: (stepIndex, data) => data.isActueel === false,
    description: (data) =>
      `
        <p>
          ${
            data.isActueel
              ? `Uw recht op ${data.titel} stopt per ${defaultDateFormat(data.datumEindeGeldigheid)}.`
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
