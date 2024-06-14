import { defaultDateFormat } from '../../../../universal/helpers';
import { ZorgnedStatusLineItemTransformerConfig } from '../../zorgned/zorgned-config-and-types';

export const PCVERGOEDING: ZorgnedStatusLineItemTransformerConfig[] = [
  {
    status: 'Besluit',
    datePublished: (aanvraag) => aanvraag.datumBesluit,
    isChecked: (stepIndex, aanvraag) => true,
    isActive: (stepIndex, aanvraag) => aanvraag.isActueel === true,
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
    datePublished: (aanvraag) => aanvraag.datumBesluit,
    isChecked: (stepIndex, aanvraag) => true,
    isActive: (stepIndex, aanvraag) => aanvraag.isActueel === true,
    description: (aanvraag) =>
      `
        <p>
          Uw heeft voldaan aan de voorwaarde voor het recht op ${aanvraag.titel} per ${defaultDateFormat(
            aanvraag.datumIngangGeldigheid
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
    datePublished: (aanvraag) =>
      (aanvraag.isActueel ? '' : aanvraag.datumEindeGeldigheid) || '',
    isChecked: () => false,
    isActive: (stepIndex, aanvraag) => aanvraag.isActueel === false,
    description: (aanvraag) =>
      `
        <p>
          ${
            aanvraag.isActueel
              ? 'Op het moment dat uw recht stopt, ontvangt u hiervan bericht.'
              : `Uw recht op ${aanvraag.titel} is beëindigd ${
                  aanvraag.datumEindeGeldigheid
                    ? `per ${defaultDateFormat(aanvraag.datumEindeGeldigheid)}`
                    : ''
                }`
          }
        </p>
      `,
  },
];
