import { defaultDateFormat } from '../../../../universal/helpers/date';
import { ZorgnedStatusLineItemTransformerConfig } from '../../zorgned/zorgned-config-and-types';

export const DECLARATIE: ZorgnedStatusLineItemTransformerConfig[] = [
  {
    status: 'Besluit',
    datePublished: (regeling) => regeling.datumBesluit,
    isChecked: (stepIndex, regeling) => true,
    isActive: (stepIndex, regeling) => true,
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
];
